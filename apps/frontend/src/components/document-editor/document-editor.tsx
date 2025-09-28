import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

interface DocumentEditorProps {
    documentId?: string;
    intialContent?: any;
    onSave?: (content: any) => void;
}

const theme = {

    heading: {
        h1: 'text-3xl font-bold mb-4',
        h2: 'text-2xl font-bold mb-3',
        h3: 'text-xl font-bold mb-2',
    },
    paragraph: "mb-2",
    quote: "border-1-4 border-gray-300 pl-4 italic my-4",
    list: {
        nested: {
            listItem: "pl-4",
        },
        ol: 'list-decimal list-inside',
        ul: 'list-disc list-inside',

    },
    link: 'text-blue-500 hover:underline hover:text-blue-600',
    code: "bg-gray-100 rounded py-0.5 px-1 text-sm font-mono",
}

