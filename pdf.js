const { jsPDF } = window.jspdf;
const { PDFDocument, rgb, degrees } = PDFLib;

// Dark Mode
function toggleMode(){
    document.body.classList.toggle("dark");
}

// Text to PDF
function textToPDF(){
    const doc = new jsPDF();
    const text = document.getElementById("text").value;
    doc.text(text,10,10);
    doc.save("TextPDF.pdf");
}

// Image to PDF
function imageToPDF(){
    const file = document.getElementById("imgInput").files[0];
    const reader = new FileReader();

    reader.onload = function(e){
        const doc = new jsPDF();
        doc.addImage(e.target.result,'JPEG',10,10,180,160);
        doc.save("ImagePDF.pdf");
    }

    reader.readAsDataURL(file);
}

// Merge PDF
async function mergePDF(){
    const files = document.getElementById("mergeInput").files;
    const mergedPdf = await PDFDocument.create();

    for(let file of files){
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    download(mergedBytes,"Merged.pdf");
}

// Split PDF
async function splitPDF(){
    const file = document.getElementById("splitInput").files[0];
    const pageNo = document.getElementById("splitPage").value - 1;

    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const newPdf = await PDFDocument.create();

    const [page] = await newPdf.copyPages(pdf,[pageNo]);
    newPdf.addPage(page);

    const newBytes = await newPdf.save();
    download(newBytes,"Split.pdf");
}

// Add Watermark
async function addWatermark(){
    const file = document.getElementById("watermarkInput").files[0];
    const text = document.getElementById("watermarkText").value;

    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pages = pdf.getPages();

    pages.forEach(page=>{
        page.drawText(text,{
            x:50,
            y:300,
            size:40,
            color: rgb(0.75,0.75,0.75),
            rotate: degrees(45)
        });
    });

    const newBytes = await pdf.save();
    download(newBytes,"Watermarked.pdf");
}

// Download Function
function download(bytes,filename){
    const blob = new Blob([bytes],{type:"application/pdf"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
