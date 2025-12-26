// // Global variables
// let uploadedFiles = {
//     1: null,
//     2: null
// };

// let analysisResults = null;

// // Initialize the application
// document.addEventListener('DOMContentLoaded', function() {
//     initializeThresholdSlider();
//     checkAnalyzeButton();
// });

// // Threshold slider functionality
// function initializeThresholdSlider() {
//     const slider = document.getElementById('threshold');
//     const valueDisplay = document.getElementById('threshold-value');
    
//     slider.addEventListener('input', function() {
//         valueDisplay.textContent = this.value;
//     });
// }

// // File upload handling
// function handleFileSelect(event, imageNumber) {
//     const file = event.target.files[0];
//     if (file) {
//         processFile(file, imageNumber);
//     }
// }

// // Drag and drop functionality
// function handleDragOver(event) {
//     event.preventDefault();
//     event.currentTarget.classList.add('drag-over');
// }

// function handleDragLeave(event) {
//     event.preventDefault();
//     event.currentTarget.classList.remove('drag-over');
// }

// function handleDrop(event, imageNumber) {
//     event.preventDefault();
//     event.currentTarget.classList.remove('drag-over');
    
//     const files = event.dataTransfer.files;
//     if (files.length > 0) {
//         const file = files[0];
//         if (file.type.startsWith('image/')) {
//             processFile(file, imageNumber);
//         } else {
//             showError('Please upload a valid image file.');
//         }
//     }
// }

// // Process uploaded file
// function processFile(file, imageNumber) {
//     // Validate file type
//     const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];
//     if (!validTypes.includes(file.type)) {
//         showError('Invalid file format. Please upload: PNG, JPG, JPEG, GIF, BMP, or TIFF');
//         return;
//     }
    
//     // Validate file size (max 10MB)
//     const maxSize = 10 * 1024 * 1024; // 10MB
//     if (file.size > maxSize) {
//         showError('File size too large. Maximum size is 10MB.');
//         return;
//     }
    
//     uploadedFiles[imageNumber] = file;
    
//     // Display file info
//     document.getElementById(`filename${imageNumber}`).textContent = file.name;
//     document.getElementById(`filesize${imageNumber}`).textContent = formatFileSize(file.size);
    
//     // Show image preview
//     const reader = new FileReader();
//     reader.onload = function(e) {
//         const img = document.getElementById(`img${imageNumber}`);
//         img.src = e.target.result;
        
//         // Hide upload content and show preview
//         document.getElementById(`upload-content-${imageNumber}`).style.display = 'none';
//         document.getElementById(`preview${imageNumber}`).style.display = 'block';
//     };
//     reader.readAsDataURL(file);
    
//     checkAnalyzeButton();
// }

// // Remove uploaded image
// function removeImage(imageNumber) {
//     uploadedFiles[imageNumber] = null;
    
//     // Reset file input
//     document.getElementById(`file${imageNumber}`).value = '';
    
//     // Reset display
//     document.getElementById(`filename${imageNumber}`).textContent = 'No file selected';
//     document.getElementById(`filesize${imageNumber}`).textContent = '';
    
//     // Hide preview and show upload content
//     document.getElementById(`preview${imageNumber}`).style.display = 'none';
//     document.getElementById(`upload-content-${imageNumber}`).style.display = 'block';
    
//     checkAnalyzeButton();
// }

// // Check if analyze button should be enabled
// function checkAnalyzeButton() {
//     const analyzeBtn = document.getElementById('analyze-btn');
//     const hasAllFiles = uploadedFiles[1] && uploadedFiles[2];
    
//     analyzeBtn.disabled = !hasAllFiles;
// }

// // Convert file to base64
// function fileToBase64(file) {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.readAsDataURL(file);
//         reader.onload = () => resolve(reader.result);
//         reader.onerror = error => reject(error);
//     });
// }

// // Analyze images
// async function analyzeImages() {
//     if (!uploadedFiles[1] || !uploadedFiles[2]) {
//         showError('Please upload both images before analyzing.');
//         return;
//     }
    
//     const threshold = document.getElementById('threshold').value;
//     const startTime = Date.now();
    
//     try {
//         // Show loading overlay
//         showLoading();
        
//         // Convert files to base64
//         const image1Base64 = await fileToBase64(uploadedFiles[1]);
//         const image2Base64 = await fileToBase64(uploadedFiles[2]);
        
//         // Prepare request data
//         const requestData = {
//             image1: image1Base64,
//             image2: image2Base64,
//             threshold: parseFloat(threshold)
//         };
        
//         // Make API request
//         const response = await fetch('/api/forgery/analyze', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(requestData)
//         });
        
//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
//         }
        
//         const results = await response.json();
//         const processingTime = Date.now() - startTime;
        
//         // Store results
//         analysisResults = {
//             ...results,
//             processing_time: processingTime
//         };
        
//         // Hide loading and show results
//         hideLoading();
//         displayResults(analysisResults);
        
//     } catch (error) {
//         hideLoading();
//         showError(`Analysis failed: ${error.message}`);
//         console.error('Analysis error:', error);
//     }
// }

// // Display analysis results
// function displayResults(results) {
//     // Show results section
//     document.getElementById('results-section').style.display = 'block';
    
//     // Scroll to results
//     document.getElementById('results-section').scrollIntoView({ 
//         behavior: 'smooth',
//         block: 'start'
//     });
    
//     // Update status card
//     updateStatusCard(results);
    
//     // Update similarity card
//     updateSimilarityCard(results);
    
//     // Update technical details
//     updateTechnicalDetails(results);
// }

// // Update status card
// function updateStatusCard(results) {
//     const statusIndicator = document.getElementById('status-indicator');
//     const statusText = document.getElementById('status-text');
//     const confidenceScore = document.getElementById('confidence-score');
//     const statusMessage = document.getElementById('status-message');
    
//     // Update status indicator
//     statusIndicator.className = 'status-indicator';
//     if (results.is_forgery) {
//         statusIndicator.classList.add('forgery');
//         statusText.textContent = 'Potential Forgery';
//         statusText.className = 'status-text forgery';
//     } else {
//         statusIndicator.classList.add('authentic');
//         statusText.textContent = 'Authentic/Similar';
//         statusText.className = 'status-text authentic';
//     }
    
//     // Update confidence score
//     const confidence = Math.round(results.confidence * 100);
//     confidenceScore.textContent = `${confidence}%`;
    
//     // Update message
//     statusMessage.textContent = results.message;
// }

// // Update similarity card
// function updateSimilarityCard(results) {
//     const similarityFill = document.getElementById('similarity-fill');
//     const similarityValue = document.getElementById('similarity-value');
//     const similarityScore = document.getElementById('similarity-score');
//     const thresholdUsed = document.getElementById('threshold-used');
    
//     // Update similarity meter
//     const similarityPercent = Math.round(results.similarity_score * 100);
//     similarityFill.style.width = `${similarityPercent}%`;
//     similarityValue.textContent = `${similarityPercent}%`;
    
//     // Update details
//     similarityScore.textContent = results.similarity_score.toFixed(4);
//     thresholdUsed.textContent = results.threshold_used.toFixed(2);
// }

// // Update technical details
// function updateTechnicalDetails(results) {
//     const processingTime = document.getElementById('processing-time');
//     const analysisTimestamp = document.getElementById('analysis-timestamp');
    
//     // Update processing time
//     if (results.processing_time) {
//         const timeInSeconds = (results.processing_time / 1000).toFixed(2);
//         processingTime.textContent = `${timeInSeconds}s`;
//     }
    
//     // Update timestamp
//     if (results.timestamp) {
//         const date = new Date(results.timestamp);
//         analysisTimestamp.textContent = date.toLocaleString();
//     } else {
//         analysisTimestamp.textContent = new Date().toLocaleString();
//     }
// }

// // Show loading overlay
// function showLoading() {
//     document.getElementById('loading-overlay').style.display = 'flex';
    
//     // Simulate progress
//     let progress = 0;
//     const progressFill = document.getElementById('progress-fill');
//     const progressText = document.getElementById('progress-text');
    
//     const interval = setInterval(() => {
//         progress += Math.random() * 15;
//         if (progress > 90) progress = 90;
        
//         progressFill.style.width = `${progress}%`;
//         progressText.textContent = `${Math.round(progress)}%`;
//     }, 200);
    
//     // Store interval for cleanup
//     window.loadingInterval = interval;
// }

// // Hide loading overlay
// function hideLoading() {
//     if (window.loadingInterval) {
//         clearInterval(window.loadingInterval);
//     }
    
//     // Complete progress
//     const progressFill = document.getElementById('progress-fill');
//     const progressText = document.getElementById('progress-text');
//     progressFill.style.width = '100%';
//     progressText.textContent = '100%';
    
//     // Hide after short delay
//     setTimeout(() => {
//         document.getElementById('loading-overlay').style.display = 'none';
//         // Reset progress
//         progressFill.style.width = '0%';
//         progressText.textContent = '0%';
//     }, 500);
// }

// // Show model information modal
// async function showModelInfo() {
//     const modal = document.getElementById('modal-overlay');
//     const modalContent = document.getElementById('modal-content');
    
//     modal.style.display = 'flex';
    
//     try {
//         const response = await fetch('/api/forgery/model-info');
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const modelInfo = await response.json();
        
//         modalContent.innerHTML = `
//             <div class="model-info">
//                 <div class="info-section">
//                     <h4>Model Details</h4>
//                     <div class="info-grid">
//                         <div class="info-item">
//                             <span>Model Name:</span>
//                             <span>${modelInfo.model_name}</span>
//                         </div>
//                         <div class="info-item">
//                             <span>Model Type:</span>
//                             <span>${modelInfo.model_type}</span>
//                         </div>
//                         <div class="info-item">
//                             <span>Input Size:</span>
//                             <span>${modelInfo.input_size}</span>
//                         </div>
//                         <div class="info-item">
//                             <span>Feature Extraction:</span>
//                             <span>${modelInfo.feature_extraction}</span>
//                         </div>
//                         <div class="info-item">
//                             <span>Similarity Metric:</span>
//                             <span>${modelInfo.similarity_metric}</span>
//                         </div>
//                         <div class="info-item">
//                             <span>Default Threshold:</span>
//                             <span>${modelInfo.default_threshold}</span>
//                         </div>
//                     </div>
//                 </div>
//                 <div class="info-section">
//                     <h4>Description</h4>
//                     <p>${modelInfo.description}</p>
//                 </div>
//             </div>
//         `;
        
//     } catch (error) {
//         modalContent.innerHTML = `
//             <div class="error-message">
//                 <i class="fas fa-exclamation-triangle"></i>
//                 <p>Failed to load model information: ${error.message}</p>
//             </div>
//         `;
//     }
// }

// // Close modal
// function closeModal() {
//     document.getElementById('modal-overlay').style.display = 'none';
// }

// // Download analysis report
// function downloadReport() {
//     if (!analysisResults) {
//         showError('No analysis results to download.');
//         return;
//     }
    
//     const report = {
//         analysis_results: analysisResults,
//         files: {
//             image1: uploadedFiles[1] ? uploadedFiles[1].name : 'Unknown',
//             image2: uploadedFiles[2] ? uploadedFiles[2].name : 'Unknown'
//         },
//         generated_at: new Date().toISOString()
//     };
    
//     const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
    
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `forgery_analysis_report_${Date.now()}.json`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
    
//     URL.revokeObjectURL(url);
// }

// // Reset analysis
// function resetAnalysis() {
//     // Clear uploaded files
//     uploadedFiles = { 1: null, 2: null };
    
//     // Reset file inputs
//     document.getElementById('file1').value = '';
//     document.getElementById('file2').value = '';
    
//     // Reset displays
//     for (let i = 1; i <= 2; i++) {
//         document.getElementById(`filename${i}`).textContent = 'No file selected';
//         document.getElementById(`filesize${i}`).textContent = '';
//         document.getElementById(`preview${i}`).style.display = 'none';
//         document.getElementById(`upload-content-${i}`).style.display = 'block';
//     }
    
//     // Hide results section
//     document.getElementById('results-section').style.display = 'none';
    
//     // Reset threshold
//     document.getElementById('threshold').value = 0.85;
//     document.getElementById('threshold-value').textContent = '0.85';
    
//     // Clear results
//     analysisResults = null;
    
//     // Check analyze button
//     checkAnalyzeButton();
    
//     // Scroll to top
//     window.scrollTo({ top: 0, behavior: 'smooth' });
// }

// // Utility functions
// function formatFileSize(bytes) {
//     if (bytes === 0) return '0 Bytes';
    
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
    
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// }

// function showError(message) {
//     // Create error notification
//     const errorDiv = document.createElement('div');
//     errorDiv.className = 'error-notification';
//     errorDiv.innerHTML = `
//         <div class="error-content">
//             <i class="fas fa-exclamation-circle"></i>
//             <span>${message}</span>
//             <button onclick="this.parentElement.parentElement.remove()">
//                 <i class="fas fa-times"></i>
//             </button>
//         </div>
//     `;
    
//     // Add styles if not already added
//     if (!document.querySelector('#error-styles')) {
//         const style = document.createElement('style');
//         style.id = 'error-styles';
//         style.textContent = `
//             .error-notification {
//                 position: fixed;
//                 top: 2rem;
//                 right: 2rem;
//                 background: #fee2e2;
//                 border: 1px solid #fecaca;
//                 border-radius: 0.75rem;
//                 padding: 1rem;
//                 box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
//                 z-index: 1001;
//                 max-width: 400px;
//                 animation: slideIn 0.3s ease;
//             }
            
//             .error-content {
//                 display: flex;
//                 align-items: center;
//                 gap: 0.75rem;
//                 color: #dc2626;
//             }
            
//             .error-content i:first-child {
//                 font-size: 1.25rem;
//             }
            
//             .error-content button {
//                 background: none;
//                 border: none;
//                 color: #dc2626;
//                 cursor: pointer;
//                 padding: 0.25rem;
//                 border-radius: 0.25rem;
//                 margin-left: auto;
//             }
            
//             .error-content button:hover {
//                 background: rgba(220, 38, 38, 0.1);
//             }
            
//             @keyframes slideIn {
//                 from {
//                     transform: translateX(100%);
//                     opacity: 0;
//                 }
//                 to {
//                     transform: translateX(0);
//                     opacity: 1;
//                 }
//             }
//         `;
//         document.head.appendChild(style);
//     }
    
//     document.body.appendChild(errorDiv);
    
//     // Auto remove after 5 seconds
//     setTimeout(() => {
//         if (errorDiv.parentElement) {
//             errorDiv.remove();
//         }
//     }, 5000);
// }

// // Close modal when clicking outside
// document.addEventListener('click', function(event) {
//     const modal = document.getElementById('modal-overlay');
//     if (event.target === modal) {
//         closeModal();
//     }
// });

// // Keyboard shortcuts
// document.addEventListener('keydown', function(event) {
//     // Escape key to close modal
//     if (event.key === 'Escape') {
//         closeModal();
//     }
    
//     // Ctrl/Cmd + Enter to analyze
//     if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
//         if (!document.getElementById('analyze-btn').disabled) {
//             analyzeImages();
//         }
//     }
// });



// Global variables
let uploadedFiles = {
    1: null,
    2: null
};

let analysisResults = null;

// Configuration
const API_CONFIG = {
    baseURL: window.location.origin,
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeThresholdSlider();
    checkAnalyzeButton();
    addErrorStyles();
});

// Add error notification styles
function addErrorStyles() {
    if (!document.querySelector('#error-styles')) {
        const style = document.createElement('style');
        style.id = 'error-styles';
        style.textContent = `
            .error-notification {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: #fee2e2;
                border: 1px solid #fecaca;
                border-radius: 0.75rem;
                padding: 1rem;
                box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
                z-index: 1001;
                max-width: 400px;
                animation: slideIn 0.3s ease;
            }
            
            .error-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                color: #dc2626;
            }
            
            .error-content i:first-child {
                font-size: 1.25rem;
            }
            
            .error-content button {
                background: none;
                border: none;
                color: #dc2626;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 0.25rem;
                transition: background-color 0.2s;
            }
            
            .error-content button:hover {
                background: rgba(220, 38, 38, 0.1);
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .success-notification {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: #d1fae5;
                border: 1px solid #a7f3d0;
                border-radius: 0.75rem;
                padding: 1rem;
                box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
                z-index: 1001;
                max-width: 400px;
                animation: slideIn 0.3s ease;
                color: #065f46;
            }
        `;
        document.head.appendChild(style);
    }
}

// Enhanced fetch function with retry logic and better error handling
async function fetchWithRetry(url, options = {}, retries = API_CONFIG.retryAttempts) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                // If response is not JSON, use status text
            }
            
            throw new Error(errorMessage);
        }
        
        return response;
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Please check your connection and try again.');
        }
        
        if (retries > 0 && (error.name === 'TypeError' || error.message.includes('Failed to fetch'))) {
            console.log(`Retrying request... (${API_CONFIG.retryAttempts - retries + 1}/${API_CONFIG.retryAttempts})`);
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
            return fetchWithRetry(url, options, retries - 1);
        }
        
        throw error;
    }
}

// Threshold slider functionality
function initializeThresholdSlider() {
    const slider = document.getElementById('threshold');
    const valueDisplay = document.getElementById('threshold-value');
    
    if (slider && valueDisplay) {
        slider.addEventListener('input', function() {
            valueDisplay.textContent = this.value;
        });
    }
}

// File upload handling
function handleFileSelect(event, imageNumber) {
    const file = event.target.files[0];
    if (file) {
        processFile(file, imageNumber);
    }
}

// Drag and drop functionality
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
}

function handleDrop(event, imageNumber) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            processFile(file, imageNumber);
        } else {
            showError('Please upload a valid image file.');
        }
    }
}

// Process uploaded file
function processFile(file, imageNumber) {
    try {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];
        if (!validTypes.includes(file.type)) {
            showError('Invalid file format. Please upload: PNG, JPG, JPEG, GIF, BMP, or TIFF');
            return;
        }
        
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            showError('File size too large. Maximum size is 10MB.');
            return;
        }
        
        uploadedFiles[imageNumber] = file;
        
        // Display file info
        const filenameElement = document.getElementById(`filename${imageNumber}`);
        const filesizeElement = document.getElementById(`filesize${imageNumber}`);
        
        if (filenameElement) filenameElement.textContent = file.name;
        if (filesizeElement) filesizeElement.textContent = formatFileSize(file.size);
        
        // Show image preview
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById(`img${imageNumber}`);
            if (img) {
                img.src = e.target.result;
                
                // Hide upload content and show preview
                const uploadContent = document.getElementById(`upload-content-${imageNumber}`);
                const preview = document.getElementById(`preview${imageNumber}`);
                
                if (uploadContent) uploadContent.style.display = 'none';
                if (preview) preview.style.display = 'block';
            }
        };
        
        reader.onerror = function() {
            showError('Failed to read the selected file. Please try again.');
        };
        
        reader.readAsDataURL(file);
        checkAnalyzeButton();
        
    } catch (error) {
        showError(`Error processing file: ${error.message}`);
    }
}

// Remove uploaded image
function removeImage(imageNumber) {
    try {
        uploadedFiles[imageNumber] = null;
        
        // Reset file input
        const fileInput = document.getElementById(`file${imageNumber}`);
        if (fileInput) fileInput.value = '';
        
        // Reset display
        const filenameElement = document.getElementById(`filename${imageNumber}`);
        const filesizeElement = document.getElementById(`filesize${imageNumber}`);
        
        if (filenameElement) filenameElement.textContent = 'No file selected';
        if (filesizeElement) filesizeElement.textContent = '';
        
        // Hide preview and show upload content
        const preview = document.getElementById(`preview${imageNumber}`);
        const uploadContent = document.getElementById(`upload-content-${imageNumber}`);
        
        if (preview) preview.style.display = 'none';
        if (uploadContent) uploadContent.style.display = 'block';
        
        checkAnalyzeButton();
        
    } catch (error) {
        showError(`Error removing image: ${error.message}`);
    }
}

// Check if analyze button should be enabled
function checkAnalyzeButton() {
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        const hasAllFiles = uploadedFiles[1] && uploadedFiles[2];
        analyzeBtn.disabled = !hasAllFiles;
    }
}

// Convert file to base64 with error handling
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(new Error(`Failed to read file: ${error.message || 'Unknown error'}`));
        } catch (error) {
            reject(new Error(`File conversion error: ${error.message}`));
        }
    });
}

// Enhanced analyze images function with better error handling
async function analyzeImages() {
    if (!uploadedFiles[1] || !uploadedFiles[2]) {
        showError('Please upload both images before analyzing.');
        return;
    }
    
    const thresholdElement = document.getElementById('threshold');
    if (!thresholdElement) {
        showError('Threshold control not found. Please refresh the page.');
        return;
    }
    
    const threshold = thresholdElement.value;
    const startTime = Date.now();
    
    try {
        // Show loading overlay
        showLoading();
        
        // Convert files to base64
        const image1Base64 = await fileToBase64(uploadedFiles[1]);
        const image2Base64 = await fileToBase64(uploadedFiles[2]);
        
        // Prepare request data
        const requestData = {
            image1: image1Base64,
            image2: image2Base64,
            threshold: parseFloat(threshold)
        };
        
        // Make API request with enhanced error handling
        const response = await fetchWithRetry(`${API_CONFIG.baseURL}/api/forgery/analyze`, {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
        
        const results = await response.json();
        const processingTime = Date.now() - startTime;
        
        // Store results
        analysisResults = {
            ...results,
            processing_time: processingTime
        };
        
        // Hide loading and show results
        hideLoading();
        displayResults(analysisResults);
        showSuccess('Analysis completed successfully!');
        
    } catch (error) {
        hideLoading();
        console.error('Analysis error:', error);
        
        let errorMessage = 'Analysis failed. ';
        
        if (error.message.includes('timeout')) {
            errorMessage += 'The request timed out. Please try again.';
        } else if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            errorMessage += 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (error.message.includes('500')) {
            errorMessage += 'Server error. Please try again later.';
        } else if (error.message.includes('404')) {
            errorMessage += 'Analysis service not found. Please contact support.';
        } else {
            errorMessage += error.message;
        }
        
        showError(errorMessage);
    }
}

// Display analysis results with error handling
function displayResults(results) {
    try {
        if (!results) {
            showError('No results to display.');
            return;
        }
        
        // Show results section
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.style.display = 'block';
            
            // Scroll to results
            resultsSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        // Update status card
        updateStatusCard(results);
        
        // Update similarity card
        updateSimilarityCard(results);
        
        // Update technical details
        updateTechnicalDetails(results);
        
    } catch (error) {
        showError(`Error displaying results: ${error.message}`);
    }
}

// Update status card with error handling
function updateStatusCard(results) {
    try {
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        const confidenceScore = document.getElementById('confidence-score');
        const statusMessage = document.getElementById('status-message');
        
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator';
            if (results.is_forgery) {
                statusIndicator.classList.add('forgery');
            } else {
                statusIndicator.classList.add('authentic');
            }
        }
        
        if (statusText) {
            statusText.textContent = results.is_forgery ? 'Potential Forgery' : 'Authentic/Similar';
            statusText.className = `status-text ${results.is_forgery ? 'forgery' : 'authentic'}`;
        }
        
        if (confidenceScore && results.confidence !== undefined) {
            const confidence = Math.round(results.confidence * 100);
            confidenceScore.textContent = `${confidence}%`;
        }
        
        if (statusMessage && results.message) {
            statusMessage.textContent = results.message;
        }
        
    } catch (error) {
        console.error('Error updating status card:', error);
    }
}

// Update similarity card with error handling
function updateSimilarityCard(results) {
    try {
        const similarityFill = document.getElementById('similarity-fill');
        const similarityValue = document.getElementById('similarity-value');
        const similarityScore = document.getElementById('similarity-score');
        const thresholdUsed = document.getElementById('threshold-used');
        
        if (results.similarity_score !== undefined) {
            const similarityPercent = Math.round(results.similarity_score * 100);
            
            if (similarityFill) {
                similarityFill.style.width = `${similarityPercent}%`;
            }
            
            if (similarityValue) {
                similarityValue.textContent = `${similarityPercent}%`;
            }
            
            if (similarityScore) {
                similarityScore.textContent = results.similarity_score.toFixed(4);
            }
        }
        
        if (thresholdUsed && results.threshold_used !== undefined) {
            thresholdUsed.textContent = results.threshold_used.toFixed(2);
        }
        
    } catch (error) {
        console.error('Error updating similarity card:', error);
    }
}

// Update technical details with error handling
function updateTechnicalDetails(results) {
    try {
        const processingTime = document.getElementById('processing-time');
        const analysisTimestamp = document.getElementById('analysis-timestamp');
        
        if (processingTime && results.processing_time) {
            const timeInSeconds = (results.processing_time / 1000).toFixed(2);
            processingTime.textContent = `${timeInSeconds}s`;
        }
        
        if (analysisTimestamp) {
            if (results.timestamp) {
                const date = new Date(results.timestamp);
                analysisTimestamp.textContent = date.toLocaleString();
            } else {
                analysisTimestamp.textContent = new Date().toLocaleString();
            }
        }
        
    } catch (error) {
        console.error('Error updating technical details:', error);
    }
}

// Show loading overlay
function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        
        // Simulate progress
        let progress = 0;
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            
            if (progressFill) progressFill.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${Math.round(progress)}%`;
        }, 200);
        
        // Store interval for cleanup
        window.loadingInterval = interval;
    }
}

// Hide loading overlay
function hideLoading() {
    if (window.loadingInterval) {
        clearInterval(window.loadingInterval);
        window.loadingInterval = null;
    }
    
    // Complete progress
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) progressFill.style.width = '100%';
    if (progressText) progressText.textContent = '100%';
    
    // Hide after short delay
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            // Reset progress
            if (progressFill) progressFill.style.width = '0%';
            if (progressText) progressText.textContent = '0%';
        }
    }, 500);
}

// Enhanced show model information modal with better error handling
async function showModelInfo() {
    const modal = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    
    if (!modal || !modalContent) {
        showError('Modal elements not found. Please refresh the page.');
        return;
    }
    
    modal.style.display = 'flex';
    
    // Show loading state
    modalContent.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>Loading model information...</p>
        </div>
    `;
    
    try {
        const response = await fetchWithRetry(`${API_CONFIG.baseURL}/api/forgery/model-info`);
        const modelInfo = await response.json();
        
        modalContent.innerHTML = `
            <div class="model-info">
                <div class="info-section">
                    <h4>Model Details</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span>Model Name:</span>
                            <span>${modelInfo.model_name || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span>Model Type:</span>
                            <span>${modelInfo.model_type || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span>Input Size:</span>
                            <span>${modelInfo.input_size || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span>Feature Extraction:</span>
                            <span>${modelInfo.feature_extraction || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span>Similarity Metric:</span>
                            <span>${modelInfo.similarity_metric || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span>Default Threshold:</span>
                            <span>${modelInfo.default_threshold || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <div class="info-section">
                    <h4>Description</h4>
                    <p>${modelInfo.description || 'No description available.'}</p>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Model info error:', error);
        modalContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load model information: ${error.message}</p>
                <button onclick="showModelInfo()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #4f46e5; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Download analysis report with error handling
function downloadReport() {
    try {
        if (!analysisResults) {
            showError('No analysis results to download.');
            return;
        }
        
        const report = {
            analysis_results: analysisResults,
            files: {
                image1: uploadedFiles[1] ? uploadedFiles[1].name : 'Unknown',
                image2: uploadedFiles[2] ? uploadedFiles[2].name : 'Unknown'
            },
            generated_at: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `forgery_analysis_report_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        showSuccess('Report downloaded successfully!');
        
    } catch (error) {
        showError(`Failed to download report: ${error.message}`);
    }
}

// Reset analysis with error handling
function resetAnalysis() {
    try {
        // Clear uploaded files
        uploadedFiles = { 1: null, 2: null };
        
        // Reset file inputs
        const file1 = document.getElementById('file1');
        const file2 = document.getElementById('file2');
        
        if (file1) file1.value = '';
        if (file2) file2.value = '';
        
        // Reset displays
        for (let i = 1; i <= 2; i++) {
            const filenameElement = document.getElementById(`filename${i}`);
            const filesizeElement = document.getElementById(`filesize${i}`);
            const preview = document.getElementById(`preview${i}`);
            const uploadContent = document.getElementById(`upload-content-${i}`);
            
            if (filenameElement) filenameElement.textContent = 'No file selected';
            if (filesizeElement) filesizeElement.textContent = '';
            if (preview) preview.style.display = 'none';
            if (uploadContent) uploadContent.style.display = 'block';
        }
        
        // Hide results section
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) resultsSection.style.display = 'none';
        
        // Reset threshold
        const threshold = document.getElementById('threshold');
        const thresholdValue = document.getElementById('threshold-value');
        
        if (threshold) threshold.value = 0.85;
        if (thresholdValue) thresholdValue.textContent = '0.85';
        
        // Clear results
        analysisResults = null;
        
        // Check analyze button
        checkAnalyzeButton();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        showSuccess('Analysis reset successfully!');
        
    } catch (error) {
        showError(`Error resetting analysis: ${error.message}`);
    }
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Enhanced error notification function
function showError(message) {
    try {
        // Remove existing error notifications
        const existingErrors = document.querySelectorAll('.error-notification');
        existingErrors.forEach(error => error.remove());
        
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 10000);
        
    } catch (error) {
        console.error('Error showing error notification:', error);
        alert(message); // Fallback to alert
    }
}

// Success notification function
function showSuccess(message) {
    try {
        // Remove existing success notifications
        const existingSuccess = document.querySelectorAll('.success-notification');
        existingSuccess.forEach(success => success.remove());
        
        // Create success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'success-notification';
        successDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 5000);
        
    } catch (error) {
        console.error('Error showing success notification:', error);
    }
}

// Network connectivity check
function checkNetworkConnectivity() {
    return navigator.onLine;
}

// Add network status monitoring
window.addEventListener('online', function() {
    showSuccess('Connection restored!');
});

window.addEventListener('offline', function() {
    showError('No internet connection. Please check your network.');
});

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showError('An unexpected error occurred. Please try again.');
    event.preventDefault();
});

// Global error handler for JavaScript errors
window.addEventListener('error', function(event) {
    console.error('JavaScript error:', event.error);
    showError('A technical error occurred. Please refresh the page and try again.');
});
