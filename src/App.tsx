import Editor from "@monaco-editor/react";
import './assets/css/style.css';

const initialCode = `

`

export function App() {
    return (
        <>
            <div className={'editor-container'}>
                <Editor
                    className={'editor'}
                    height="90vh"
                    defaultLanguage="yaml"
                    defaultValue=""
                    theme="vs-dark"
                    options={{
                        minimap: {
                            enabled: false
                        },
                        fontSize: 15,
                        fontLigatures: true,
                        fontFamily: "Cascadia Code",
                        autoIndent: "advanced",
                        automaticLayout: true,
                        wordWrap: "on"
                    }}
                />
            </div>
        </>
    );
}
