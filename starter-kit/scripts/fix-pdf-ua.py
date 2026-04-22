#!/usr/bin/env python3
"""fix-pdf-ua.py — Post-process Chromium-generated tagged PDFs to reach PDF/UA-1 compliance.

Two issues fixed:
  1. Missing XMP metadata stream (PDF/UA-1 rule 7.1.8).
  2. Content items that are between marked-content BDC/EMC blocks get wrapped
     in /Artifact BMC…EMC so they satisfy rule 7.1.3 (every content item must
     be tagged as real content or an artifact).

Usage:
    python3 fix-pdf-ua.py input.pdf output.pdf
"""

import sys
import re
import datetime
import pikepdf
from pikepdf import Dictionary, Name, Stream

# ---------------------------------------------------------------------------
# XMP metadata template
# ---------------------------------------------------------------------------

XMP_TEMPLATE = """\
<?xpacket begin="\xef\xbb\xbf" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:xmp="http://ns.adobe.com/xap/1.0/"
      xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
      xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/"
      xmlns:pdfuaid="http://www.aiim.org/pdfua/ns/id/">
      <dc:title>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">UPCJ Starter Kit</rdf:li>
        </rdf:Alt>
      </dc:title>
      <dc:language>
        <rdf:Bag>
          <rdf:li>en</rdf:li>
        </rdf:Bag>
      </dc:language>
      <dc:creator>
        <rdf:Seq>
          <rdf:li>UPCJ Starter Kit Build</rdf:li>
        </rdf:Seq>
      </dc:creator>
      <xmp:CreateDate>{create_date}</xmp:CreateDate>
      <xmp:ModifyDate>{modify_date}</xmp:ModifyDate>
      <xmp:CreatorTool>Chromium via Playwright</xmp:CreatorTool>
      <pdf:Producer>Chromium / fix-pdf-ua.py</pdf:Producer>
      <pdfuaid:part>1</pdfuaid:part>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>"""


def build_xmp(pdf: pikepdf.Pdf) -> bytes:
    now = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S+00:00")
    return XMP_TEMPLATE.format(create_date=now, modify_date=now).encode("utf-8")


def inject_xmp_metadata(pdf: pikepdf.Pdf) -> None:
    """Add or replace the XMP metadata stream in the document catalog."""
    xmp_bytes = build_xmp(pdf)
    stream = Stream(pdf, xmp_bytes)
    stream.stream_dict[Name.Type] = Name.Metadata
    stream.stream_dict[Name.Subtype] = Name.XML
    pdf.Root[Name.Metadata] = pdf.make_indirect(stream)


# ---------------------------------------------------------------------------
# Content stream: wrap untagged segments in /Artifact BMC…EMC
# ---------------------------------------------------------------------------

# Match a BDC or BMC opening operator (may have properties dict or name)
_BDC_RE = re.compile(r'/\S+\s+(?:<<[^>]*>>)?\s*BDC|/\S+\s+BMC', re.DOTALL)
_EMC_RE = re.compile(r'\bEMC\b')


def _tokenise(stream_bytes: bytes) -> list[tuple[str, bytes]]:
    """Return a list of (kind, content) tuples for the content stream.

    kind is one of:
      'open'   — BDC / BMC opening token (including its preceding name/dict)
      'close'  — EMC closing token
      'other'  — everything else (path ops, text blocks, etc.)
    """
    text = stream_bytes.decode("latin-1")
    tokens: list[tuple[str, bytes]] = []
    pos = 0

    while pos < len(text):
        bdc_m = _BDC_RE.search(text, pos)
        emc_m = _EMC_RE.search(text, pos)

        # Determine which marker comes first
        if bdc_m is None and emc_m is None:
            # Tail: no more markers
            tail = text[pos:]
            if tail:
                tokens.append(("other", tail.encode("latin-1")))
            break

        first_start = min(
            bdc_m.start() if bdc_m else len(text),
            emc_m.start() if emc_m else len(text),
        )

        # Emit anything before the first marker as 'other'
        if first_start > pos:
            tokens.append(("other", text[pos:first_start].encode("latin-1")))

        if bdc_m and (emc_m is None or bdc_m.start() <= emc_m.start()):
            tokens.append(("open", bdc_m.group(0).encode("latin-1")))
            pos = bdc_m.end()
        else:
            tokens.append(("close", b"EMC"))
            pos = emc_m.end()

    return tokens


def fix_untagged_content(stream_bytes: bytes) -> bytes:
    """Wrap any content that is outside a marked-content block in an
    /Artifact BMC … EMC envelope.

    We track a depth counter (incremented at BDC/BMC, decremented at EMC).
    Any 'other' token found at depth==0 is wrapped.
    """
    tokens = _tokenise(stream_bytes)
    depth = 0
    out_parts: list[bytes] = []

    for kind, content in tokens:
        if kind == "open":
            depth += 1
            out_parts.append(content)
        elif kind == "close":
            depth = max(0, depth - 1)
            out_parts.append(content)
        else:
            # 'other' — check if purely whitespace; if not, wrap as artifact
            stripped = content.strip()
            if stripped and depth == 0:
                out_parts.append(b"/Artifact BMC\n")
                out_parts.append(content)
                out_parts.append(b"\nEMC\n")
            else:
                out_parts.append(content)

    return b"".join(out_parts)


def fix_page_content_streams(pdf: pikepdf.Pdf) -> int:
    """Walk every page and fix its content stream(s). Returns pages patched."""
    patched = 0
    for i, page in enumerate(pdf.pages):
        cs = page.get("/Contents")
        if cs is None:
            continue
        # Could be a single stream or an array of streams
        if isinstance(cs, pikepdf.Array):
            streams = list(cs)
        else:
            streams = [cs]

        page_changed = False
        new_streams = []
        for s in streams:
            obj = s if isinstance(s, pikepdf.Stream) else pdf.get_object(s.objgen)
            raw = obj.read_bytes()
            fixed = fix_untagged_content(raw)
            if fixed != raw:
                new_obj = Stream(pdf, fixed)
                # Preserve existing stream dict keys except /Filter (we're now raw)
                for k, v in obj.stream_dict.items():
                    if k not in (Name.Filter, Name.DecodeParms, Name.Length):
                        new_obj.stream_dict[k] = v
                new_streams.append(pdf.make_indirect(new_obj))
                page_changed = True
            else:
                new_streams.append(s)

        if page_changed:
            if len(new_streams) == 1:
                page.obj[Name.Contents] = new_streams[0]
            else:
                page.obj[Name.Contents] = pikepdf.Array(new_streams)
            patched += 1

    return patched


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: fix-pdf-ua.py input.pdf output.pdf", file=sys.stderr)
        sys.exit(1)

    inp, out = sys.argv[1], sys.argv[2]
    print(f"Opening {inp} …")
    pdf = pikepdf.open(inp, allow_overwriting_input=True)

    print("Injecting XMP metadata …")
    inject_xmp_metadata(pdf)

    print("Fixing untagged content items …")
    patched = fix_page_content_streams(pdf)
    print(f"  Patched {patched} page(s)")

    print(f"Saving {out} …")
    pdf.save(out)
    print("Done.")


if __name__ == "__main__":
    main()
