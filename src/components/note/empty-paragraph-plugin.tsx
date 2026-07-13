import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTextNode,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  KEY_DOWN_COMMAND,
  ParagraphNode,
} from "lexical";
import { useEffect } from "react";
import { EMPTY_PARAGRAPH_MARKER } from "@/lib/mdx-blanklines";

export function EmptyParagraphPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const removeTransform = editor.registerNodeTransform(ParagraphNode, (paragraph) => {
      const parent = paragraph.getParent();
      if (paragraph.getTextContentSize() !== 0 || !parent || parent.getChildrenSize() <= 1) return;

      const marker = $createTextNode(EMPTY_PARAGRAPH_MARKER);
      paragraph.append(marker);

      const selection = $getSelection();
      if (
        $isRangeSelection(selection) &&
        selection.anchor.getNode().getKey() === paragraph.getKey()
      ) {
        marker.selectStart();
      }
    });

    const removeKeyCommand = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        const isCharacter = event.key.length === 1;
        const removesParagraph = event.key === "Backspace" || event.key === "Delete";
        const editsParagraph = isCharacter || removesParagraph;
        if (!editsParagraph || event.metaKey || event.ctrlKey || event.altKey) return false;

        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;

        const anchor = selection.anchor.getNode();
        const paragraph = $isParagraphNode(anchor) ? anchor : anchor.getParent();
        if (!$isParagraphNode(paragraph) || paragraph.getTextContent() !== EMPTY_PARAGRAPH_MARKER) {
          return false;
        }

        const marker = paragraph.getFirstChild();
        if (isCharacter && $isTextNode(marker)) {
          marker.select(0, marker.getTextContentSize());
          return false;
        }

        event.preventDefault();
        const sibling =
          event.key === "Backspace"
            ? (paragraph.getPreviousSibling() ?? paragraph.getNextSibling())
            : (paragraph.getNextSibling() ?? paragraph.getPreviousSibling());

        if (sibling) {
          paragraph.remove();
          if (event.key === "Backspace") sibling.selectEnd();
          else sibling.selectStart();
        } else {
          paragraph.clear();
          paragraph.selectStart();
        }
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );

    return () => {
      removeKeyCommand();
      removeTransform();
    };
  }, [editor]);

  return null;
}
