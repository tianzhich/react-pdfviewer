import React from "react";
import "./App.css";
import { PDFViewer } from "./PDFViewer";

// const DOC_URL = "https://pdfobject.com/pdf/sample-3pp.pdf";

const App: React.FC = () => {

  return (
    <div className="App">
      <PDFViewer />
    </div>
  );
};

export default App;
