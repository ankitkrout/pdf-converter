/**
 * ============================================
 * Ankit PDF Pro - JavaScript Functionality
 * ============================================
 * All-in-One PDF Tools using jsPDF and pdf-lib
 * 
 * Features:
 * - Text to PDF
 * - Image to PDF
 * - Merge PDFs
 * - Split PDF
 * - Add Watermark
 * - Rotate PDF
 * - Delete Page
 * - Compress PDF
 * - Dark/Light Mode
 * - Drag and Drop File Upload
 */

// ============================================
// Global Variables
// ============================================
const { jsPDF } = window.jspdf;
const { PDFDocument, rgb, degrees } = PDFLib;

// Store selected files for each tool
let selectedFiles = {
    image: [],
    merge: [],
    split: null,
    watermark: null,
    rotate: null,
    delete: null,
    compress: null
};

// ============================================
// Theme Toggle (Dark/Light Mode)
// ============================================

/**
 * Toggle between dark and light theme
 * Uses localStorage to persist the user's preference
 */
function toggleTheme() {
    const html = document.documentElement;
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = themeBtn.querySelector('.theme-icon');
    const themeText = themeBtn.querySelector('.theme-text');
    
    // Check current theme
    if (html.getAttribute('data-theme') === 'dark') {
        // Switch to light mode
        html.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
        localStorage.setItem('theme', 'light');
    } else {
        // Switch to dark mode
        html.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
        localStorage.setItem('theme', 'dark');
    }
}

/**
 * Initialize theme based on user preference
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const themeIcon = document.querySelector('.theme-icon');
        const themeText = document.querySelector('.theme-text');
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeText) themeText.textContent = 'Light Mode';
    }
}

// ============================================
// Drag and Drop Functions
// ============================================

/**
 * Handle drag over event
 * @param {DragEvent} event - Drag event
 */
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.currentTarget.querySelector('.drop-zone');
    if (dropZone) {
        dropZone.classList.add('dragover');
    }
}

/**
 * Handle drag leave event
 * @param {DragEvent} event - Drag event
 */
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.currentTarget.querySelector('.drop-zone');
    if (dropZone) {
        dropZone.classList.remove('dragover');
    }
}

/**
 * Handle drop event
 * @param {DragEvent} event - Drag event
 * @param {string} type - Type of file (image, merge, split, watermark, rotate, delete, compress)
 */
function handleDrop(event, type) {
    event.preventDefault();
    event.stopPropagation();
    
    const dropZone = event.currentTarget.querySelector('.drop-zone');
    if (dropZone) {
        dropZone.classList.remove('dragover');
    }
    
    const files = event.dataTransfer.files;
    
    if (files.length > 0) {
        // Set the files to the appropriate input
        let inputId = '';
        
        switch(type) {
            case 'image':
                inputId = 'image-input';
                selectedFiles.image = Array.from(files);
                break;
            case 'merge':
                inputId = 'merge-input';
                selectedFiles.merge = Array.from(files);
                break;
            case 'split':
                inputId = 'split-input';
                selectedFiles.split = files[0];
                break;
            case 'watermark':
                inputId = 'watermark-input';
                selectedFiles.watermark = files[0];
                break;
            case 'rotate':
                inputId = 'rotate-input';
                selectedFiles.rotate = files[0];
                break;
            case 'delete':
                inputId = 'delete-input';
                selectedFiles.delete = files[0];
                break;
            case 'compress':
                inputId = 'compress-input';
                selectedFiles.compress = files[0];
                break;
        }
        
        // Update the file info display
        updateFileInfo(type, files);
        
        // Show success message
        showToast(`${files.length} file(s) selected`, 'success');
    }
}

/**
 * Update file info display
 * @param {string} type - Type of file
 * @param {FileList} files - Selected files
 */
function updateFileInfo(type, files) {
    let infoId = '';
    let fileNames = '';
    
    switch(type) {
        case 'image':
            infoId = 'image-info';
            fileNames = Array.from(files).map(f => f.name).join(', ');
            if (fileNames.length > 50) {
                fileNames = fileNames.substring(0, 50) + '...';
            }
            break;
        case 'merge':
            infoId = 'merge-info';
            fileNames = Array.from(files).map(f => f.name).join(', ');
            if (fileNames.length > 50) {
                fileNames = fileNames.substring(0, 50) + '...';
            }
            fileNames += ` (${files.length} files)`;
            break;
        case 'split':
            infoId = 'split-info';
            fileNames = files[0].name;
            break;
        case 'watermark':
            infoId = 'watermark-info';
            fileNames = files[0].name;
            break;
        case 'rotate':
            infoId = 'rotate-info';
            fileNames = files[0].name;
            break;
        case 'delete':
            infoId = 'delete-info';
            fileNames = files[0].name;
            break;
        case 'compress':
            infoId = 'compress-info';
            fileNames = files[0].name;
            break;
    }
    
    const infoDiv = document.getElementById(infoId);
    if (infoDiv) {
        infoDiv.textContent = `Selected: ${fileNames}`;
        infoDiv.classList.add('has-file');
    }
}

// ============================================
// File Handling Functions
// ============================================

/**
 * Handle image file selection
 * @param {HTMLInputElement} input - File input element
 */
function handleImageSelect(input) {
    selectedFiles.image = Array.from(input.files);
    const infoDiv = document.getElementById('image-info');
    
    if (selectedFiles.image.length > 0) {
        const fileNames = selectedFiles.image.map(f => f.name).join(', ');
        const displayNames = fileNames.length > 50 ? fileNames.substring(0, 50) + '...' : fileNames;
        infoDiv.textContent = `Selected: ${displayNames}`;
        infoDiv.classList.add('has-file');
    } else {
        infoDiv.textContent = '';
        infoDiv.classList.remove('has-file');
    }
}

/**
 * Handle merge PDF file selection
 * @param {HTMLInputElement} input - File input element
 */
function handleMergeSelect(input) {
    selectedFiles.merge = Array.from(input.files);
    const infoDiv = document.getElementById('merge-info');
    
    if (selectedFiles.merge.length > 0) {
        const fileNames = selectedFiles.merge.map(f => f.name).join(', ');
        const displayNames = fileNames.length > 50 ? fileNames.substring(0, 50) + '...' : fileNames;
        infoDiv.textContent = `Selected: ${displayNames} (${selectedFiles.merge.length} files)`;
        infoDiv.classList.add('has-file');
    } else {
        infoDiv.textContent = '';
        infoDiv.classList.remove('has-file');
    }
}

/**
 * Handle split PDF file selection
 * @param {HTMLInputElement} input - File input element
 */
function handleSplitSelect(input) {
    selectedFiles.split = input.files[0] || null;
    const infoDiv = document.getElementById('split-info');
    
    if (selectedFiles.split) {
        infoDiv.textContent = `Selected: ${selectedFiles.split.name}`;
        infoDiv.classList.add('has-file');
    } else {
        infoDiv.textContent = '';
        infoDiv.classList.remove('has-file');
    }
}

/**
 * Handle watermark PDF file selection
 * @param {HTMLInputElement} input - File input element
 */
function handleWatermarkSelect(input) {
    selectedFiles.watermark = input.files[0] || null;
    const infoDiv = document.getElementById('watermark-info');
    
    if (selectedFiles.watermark) {
        infoDiv.textContent = `Selected: ${selectedFiles.watermark.name}`;
        infoDiv.classList.add('has-file');
    } else {
        infoDiv.textContent = '';
        infoDiv.classList.remove('has-file');
    }
}

/**
 * Handle rotate PDF file selection
 * @param {HTMLInputElement} input - File input element
 */
function handleRotateSelect(input) {
    selectedFiles.rotate = input.files[0] || null;
    const infoDiv = document.getElementById('rotate-info');
    
    if (selectedFiles.rotate) {
        infoDiv.textContent = `Selected: ${selectedFiles.rotate.name}`;
        infoDiv.classList.add('has-file');
    } else {
        infoDiv.textContent = '';
        infoDiv.classList.remove('has-file');
    }
}

/**
 * Handle delete PDF file selection
 * @param {HTMLInputElement} input - File input element
 */
function handleDeleteSelect(input) {
    selectedFiles.delete = input.files[0] || null;
    const infoDiv = document.getElementById('delete-info');
    
    if (selectedFiles.delete) {
        infoDiv.textContent = `Selected: ${selectedFiles.delete.name}`;
        infoDiv.classList.add('has-file');
    } else {
        infoDiv.textContent = '';
        infoDiv.classList.remove('has-file');
    }
}

/**
 * Handle compress PDF file selection
 * @param {HTMLInputElement} input - File input element
 */
function handleCompressSelect(input) {
    selectedFiles.compress = input.files[0] || null;
    const infoDiv = document.getElementById('compress-info');
    
    if (selectedFiles.compress) {
        infoDiv.textContent = `Selected: ${selectedFiles.compress.name}`;
        infoDiv.classList.add('has-file');
    } else {
        infoDiv.textContent = '';
        infoDiv.classList.remove('has-file');
    }
}

// ============================================
// Download Helper Function
// ============================================

/**
 * Download the processed PDF file
 * @param {Uint8Array} bytes - PDF file bytes
 * @param {string} filename - Name for the downloaded file
 */
function downloadPDF(bytes, filename) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success/error)
 */
function showToast(message, type = 'success') {
    // Remove existing toasts
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// ============================================
// PDF Tool Functions
// ============================================

/**
 * Convert text to PDF document
 * Uses jsPDF library
 */
function textToPDF() {
    const text = document.getElementById('text-input').value.trim();
    
    if (!text) {
        showToast('Please enter some text to convert!', 'error');
        return;
    }
    
    try {
        // Create new jsPDF document
        const doc = new jsPDF();
        
        // Split text to fit page width
        const splitText = doc.splitTextToSize(text, 180);
        
        // Add text to PDF
        doc.text(splitText, 10, 20);
        
        // Save the PDF
        doc.save('text-to-pdf.pdf');
        showToast('Text converted to PDF successfully!', 'success');
    } catch (error) {
        console.error('Error converting text to PDF:', error);
        showToast('Error converting text to PDF!', 'error');
    }
}

/**
 * Convert image(s) to PDF document
 * Supports JPG and PNG formats
 * Uses jsPDF library
 */
async function imageToPDF() {
    if (selectedFiles.image.length === 0) {
        showToast('Please select an image first!', 'error');
        return;
    }
    
    try {
        const doc = new jsPDF();
        
        for (let i = 0; i < selectedFiles.image.length; i++) {
            const file = selectedFiles.image[i];
            
            // Read image as data URL
            const dataUrl = await readFileAsDataURL(file);
            
            // Get image dimensions
            const imgProps = doc.getImageProperties(dataUrl);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            // Add new page for each image (except first)
            if (i > 0) {
                doc.addPage();
            }
            
            // Add image to PDF (fit to page)
            doc.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
        
        doc.save('image-to-pdf.pdf');
        showToast('Image converted to PDF successfully!', 'success');
    } catch (error) {
        console.error('Error converting image to PDF:', error);
        showToast('Error converting image to PDF!', 'error');
    }
}

/**
 * Merge multiple PDF files into one
 * Uses pdf-lib library
 */
async function mergePDFs() {
    if (selectedFiles.merge.length < 2) {
        showToast('Please select at least 2 PDF files to merge!', 'error');
        return;
    }
    
    try {
        // Create new PDF document
        const mergedPdf = await PDFDocument.create();
        
        // Process each PDF file
        for (const file of selectedFiles.merge) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            
            // Copy all pages from source PDF
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(page => mergedPdf.addPage(page));
        }
        
        // Save and download merged PDF
        const mergedBytes = await mergedPdf.save();
        downloadPDF(mergedBytes, 'merged-pdf.pdf');
        showToast('PDFs merged successfully!', 'success');
    } catch (error) {
        console.error('Error merging PDFs:', error);
        showToast('Error merging PDF files!', 'error');
    }
}

/**
 * Split PDF by extracting specific page
 * Uses pdf-lib library
 */
async function splitPDF() {
    if (!selectedFiles.split) {
        showToast('Please select a PDF file first!', 'error');
        return;
    }
    
    const pageNum = parseInt(document.getElementById('split-page').value);
    
    if (!pageNum || pageNum < 1) {
        showToast('Please enter a valid page number!', 'error');
        return;
    }
    
    try {
        const arrayBuffer = await selectedFiles.split.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const totalPages = pdf.getPageCount();
        
        if (pageNum > totalPages) {
            showToast(`Page number exceeds total pages (${totalPages})!`, 'error');
            return;
        }
        
        // Create new PDF with selected page
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [pageNum - 1]); // 0-indexed
        newPdf.addPage(page);
        
        const newBytes = await newPdf.save();
        downloadPDF(newBytes, 'split-pdf.pdf');
        showToast('PDF split successfully!', 'success');
    } catch (error) {
        console.error('Error splitting PDF:', error);
        showToast('Error splitting PDF!', 'error');
    }
}

/**
 * Update watermark preview based on settings
 */
function updateWatermarkPreview() {
    const text = document.getElementById('watermark-text').value || 'Sample Text';
    const color = document.getElementById('watermark-color').value;
    const opacity = document.getElementById('watermark-opacity').value;
    const size = document.getElementById('watermark-size').value;
    const rotation = document.getElementById('watermark-rotation').value;
    const position = document.getElementById('watermark-position').value;
    
    const container = document.getElementById('preview-container');
    const watermark = document.getElementById('preview-watermark');
    
    if (container && watermark) {
        watermark.textContent = text;
        watermark.style.color = color;
        watermark.style.opacity = opacity;
        watermark.style.fontSize = `${size}px`;
        watermark.style.transform = `rotate(${rotation}deg)`;
        
        // Update position alignment in preview container
        container.style.display = 'flex';
        
        switch(position) {
            case 'top-left':
                container.style.justifyContent = 'flex-start';
                container.style.alignItems = 'flex-start';
                break;
            case 'top-right':
                container.style.justifyContent = 'flex-end';
                container.style.alignItems = 'flex-start';
                break;
            case 'bottom-left':
                container.style.justifyContent = 'flex-start';
                container.style.alignItems = 'flex-end';
                break;
            case 'bottom-right':
                container.style.justifyContent = 'flex-end';
                container.style.alignItems = 'flex-end';
                break;
            case 'center':
            default:
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';
                break;
        }
    }
}

/**
 * Add text watermark to PDF
 * Uses pdf-lib library
 */
async function addWatermark() {
    if (!selectedFiles.watermark) {
        showToast('Please select a PDF file first!', 'error');
        return;
    }
    
    const watermarkText = document.getElementById('watermark-text').value.trim();
    
    if (!watermarkText) {
        showToast('Please enter watermark text!', 'error');
        return;
    }

    // Get settings
    const colorHex = document.getElementById('watermark-color').value;
    const opacity = parseFloat(document.getElementById('watermark-opacity').value);
    const size = parseInt(document.getElementById('watermark-size').value);
    const rotation = parseInt(document.getElementById('watermark-rotation').value);
    const position = document.getElementById('watermark-position').value;
    
    // Convert hex to RGB for pdf-lib
    const r = parseInt(colorHex.substring(1, 3), 16) / 255;
    const g = parseInt(colorHex.substring(3, 5), 16) / 255;
    const b = parseInt(colorHex.substring(5, 7), 16) / 255;
    
    try {
        const arrayBuffer = await selectedFiles.watermark.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = pdf.getPages();
        
        // Add watermark to each page
        pages.forEach(page => {
            const { width, height } = page.getSize();
            const textWidth = watermarkText.length * (size * 0.5); // Approximate width
            const textHeight = size;
            
            let x, y;
            const margin = 20;
            
            switch(position) {
                case 'top-left':
                    x = margin;
                    y = height - margin - textHeight;
                    break;
                case 'top-right':
                    x = width - margin - textWidth;
                    y = height - margin - textHeight;
                    break;
                case 'bottom-left':
                    x = margin;
                    y = margin;
                    break;
                case 'bottom-right':
                    x = width - margin - textWidth;
                    y = margin;
                    break;
                case 'center':
                default:
                    x = (width / 2) - (textWidth / 2);
                    y = (height / 2) - (textHeight / 2);
                    break;
            }
            
            page.drawText(watermarkText, {
                x: x,
                y: y,
                size: size,
                color: rgb(r, g, b),
                rotate: degrees(rotation),
                opacity: opacity
            });
        });
        
        const newBytes = await pdf.save();
        downloadPDF(newBytes, 'watermarked-pdf.pdf');
        showToast('Watermark added successfully!', 'success');
    } catch (error) {
        console.error('Error adding watermark:', error);
        showToast('Error adding watermark!', 'error');
    }
}

/**
 * Rotate PDF pages by specified degree
 * Uses pdf-lib library
 */
async function rotatePDF() {
    if (!selectedFiles.rotate) {
        showToast('Please select a PDF file first!', 'error');
        return;
    }
    
    const degree = parseInt(document.getElementById('rotate-degree').value);
    
    try {
        const arrayBuffer = await selectedFiles.rotate.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = pdf.getPages();
        
        // Rotate each page
        pages.forEach(page => {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees(currentRotation + degree));
        });
        
        const newBytes = await pdf.save();
        downloadPDF(newBytes, 'rotated-pdf.pdf');
        showToast('PDF rotated successfully!', 'success');
    } catch (error) {
        console.error('Error rotating PDF:', error);
        showToast('Error rotating PDF!', 'error');
    }
}

/**
 * Delete specific page from PDF
 * Uses pdf-lib library
 */
async function deletePage() {
    if (!selectedFiles.delete) {
        showToast('Please select a PDF file first!', 'error');
        return;
    }
    
    const pageNum = parseInt(document.getElementById('delete-page').value);
    
    if (!pageNum || pageNum < 1) {
        showToast('Please enter a valid page number!', 'error');
        return;
    }
    
    try {
        const arrayBuffer = await selectedFiles.delete.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const totalPages = pdf.getPageCount();
        
        if (pageNum > totalPages) {
            showToast(`Page number exceeds total pages (${totalPages})!`, 'error');
            return;
        }
        
        // Remove the specified page (0-indexed)
        pdf.removePage(pageNum - 1);
        
        const newBytes = await pdf.save();
        downloadPDF(newBytes, 'page-deleted-pdf.pdf');
        showToast('Page deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting page:', error);
        showToast('Error deleting page!', 'error');
    }
}

/**
 * Compress PDF file
 * Uses pdf-lib library (basic re-save compression)
 * Note: True compression requires more complex processing
 */
async function compressPDF() {
    if (!selectedFiles.compress) {
        showToast('Please select a PDF file first!', 'error');
        return;
    }
    
    try {
        const arrayBuffer = await selectedFiles.compress.arrayBuffer();
        
        // Load the PDF
        const pdf = await PDFDocument.load(arrayBuffer, {
            ignoreEncryption: true
        });
        
        // Save with compression options
        // Note: pdf-lib's save() method automatically applies some compression
        const newBytes = await pdf.save({
            useObjectStreams: true
        });
        
        // Calculate compression ratio
        const originalSize = (arrayBuffer.byteLength / 1024).toFixed(2);
        const compressedSize = (newBytes.byteLength / 1024).toFixed(2);
        const ratio = ((1 - newBytes.byteLength / arrayBuffer.byteLength) * 100).toFixed(2);
        
        downloadPDF(newBytes, 'compressed-pdf.pdf');
        showToast(`Compressed: ${originalSize}KB → ${compressedSize}KB (${ratio}% reduction)`, 'success');
    } catch (error) {
        console.error('Error compressing PDF:', error);
        showToast('Error compressing PDF!', 'error');
    }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Read file as data URL
 * @param {File} file - File to read
 * @returns {Promise<string>} Data URL
 */
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ============================================
// Initialize Application
// ============================================

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    console.log('Ankit PDF Pro initialized successfully!');
});
