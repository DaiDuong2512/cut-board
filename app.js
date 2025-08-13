class CuttingOptimizerApp {
    constructor() {
        this.pieceList = [];
        this.currentLayout = null;
        this.nextPieceId = 1;
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.algorithms = {
            maxrects: this.maxRectsAlgorithm.bind(this),
            guillotine: this.guillotineAlgorithm.bind(this),
            bottom_left: this.bottomLeftAlgorithm.bind(this),
            best_fit: this.bestFitAlgorithm.bind(this)
        };
        
        this.translations = {
            en: {
                title: 'Cutting Optimizer',
                config: 'Control Panel',
                sheet: 'Sheet Configuration',
                sheet_width: 'Width (mm)',
                sheet_height: 'Height (mm)',
                cut_width: 'Kerf (mm)',
                algorithm: 'Algorithm',
                algorithm_maxrects: 'MaxRects (Recommended)',
                algorithm_guillotine: 'Guillotine',
                algorithm_bottom_left: 'Bottom-Left',
                algorithm_best_fit: 'Best Fit',
                add_piece: 'Add Pieces',
                piece_name: 'Name (Optional)',
                piece_name_placeholder: 'e.g., Table Top, Shelf',
                piece_width: 'Width (mm)',
                piece_height: 'Height (mm)',
                quantity: 'Quantity',
                pre: 'Preview',
                enter_dimensions: 'Enter dimensions',
                quick_add: 'Quick Add:',
                add_piece_button: 'Add Piece',
                piece_list: 'Pieces List',
                clear_all: 'Clear All',
                calculate: 'Calculate Layout',
                layout: 'Layout Results',
                print: 'Print',
                pdf: 'Export PDF'
            },
            vi: {
                title: 'Tối ưu hóa cắt',
                config: 'Bảng điều khiển',
                sheet: 'Cấu hình tấm',
                sheet_width: 'Chiều rộng (mm)',
                sheet_height: 'Chiều cao (mm)',
                cut_width: 'Độ dày cưa (mm)',
                algorithm: 'Thuật toán',
                algorithm_maxrects: 'MaxRects (Khuyến nghị)',
                algorithm_guillotine: 'Guillotine',
                algorithm_bottom_left: 'Bottom-Left',
                algorithm_best_fit: 'Best Fit',
                add_piece: 'Thêm mảnh',
                piece_name: 'Tên (Tùy chọn)',
                piece_name_placeholder: 'vd: Mặt bàn, Kệ sách',
                piece_width: 'Chiều rộng (mm)',
                piece_height: 'Chiều cao (mm)',
                quantity: 'Số lượng',
                pre: 'Xem trước',
                enter_dimensions: 'Nhập kích thước',
                quick_add: 'Thêm nhanh:',
                add_piece_button: 'Thêm mảnh',
                piece_list: 'Danh sách mảnh',
                clear_all: 'Xóa tất cả',
                calculate: 'Tính toán bố cục',
                layout: 'Kết quả bố cục',
                print: 'In',
                pdf: 'Xuất PDF'
            },
            ko: {
                title: '절단 최적화기',
                config: '제어판',
                sheet: '시트 구성',
                sheet_width: '너비 (mm)',
                sheet_height: '높이 (mm)',
                cut_width: '톱날 두께 (mm)',
                algorithm: '알고리즘',
                algorithm_maxrects: 'MaxRects (권장)',
                algorithm_guillotine: 'Guillotine',
                algorithm_bottom_left: 'Bottom-Left',
                algorithm_best_fit: 'Best Fit',
                add_piece: '조각 추가',
                piece_name: '이름 (선택사항)',
                piece_name_placeholder: '예: 테이블 상판, 선반',
                piece_width: '너비 (mm)',
                piece_height: '높이 (mm)',
                quantity: '수량',
                pre: '미리보기',
                enter_dimensions: '치수 입력',
                quick_add: '빠른 추가:',
                add_piece_button: '조각 추가',
                piece_list: '조각 목록',
                clear_all: '모두 지우기',
                calculate: '레이아웃 계산',
                layout: '레이아웃 결과',
                print: '인쇄',
                pdf: 'PDF 내보내기'
            }
        };
        
        this.currentLanguage = 'en';
        this.initializeApp();
    }
    
    initializeApp() {
        this.bindEventListeners();
        this.updateUI();
        this.loadSettings();
        this.updateLanguage();
    }
    
    bindEventListeners() {
        const pieceWidthInput = document.getElementById('piece-width');
        const pieceHeightInput = document.getElementById('piece-height');
        const pieceQuantityInput = document.getElementById('piece-quantity');
        const addPieceBtn = document.getElementById('add-piece');
        const calculateBtn = document.getElementById('calculate');
        const clearPiecesBtn = document.getElementById('clear-pieces');
        const swapDimensionsBtn = document.getElementById('swap-dimensions');
        const printLayoutBtn = document.getElementById('print-layout');
        const exportPdfBtn = document.getElementById('export-pdf');
        const zoomFitBtn = document.getElementById('zoom-fit');
        
        if (pieceWidthInput && pieceHeightInput) {
            pieceWidthInput.addEventListener('input', this.updatePiecePreview.bind(this));
            pieceHeightInput.addEventListener('input', this.updatePiecePreview.bind(this));
            pieceQuantityInput.addEventListener('input', this.updateAddButtonState.bind(this));
        }
        
        if (addPieceBtn) {
            addPieceBtn.addEventListener('click', this.addPiece.bind(this));
        }
        
        if (calculateBtn) {
            calculateBtn.addEventListener('click', this.calculateLayout.bind(this));
        }
        
        if (clearPiecesBtn) {
            clearPiecesBtn.addEventListener('click', this.clearAllPieces.bind(this));
        }
        
        if (swapDimensionsBtn) {
            swapDimensionsBtn.addEventListener('click', this.swapDimensions.bind(this));
        }
        
        if (printLayoutBtn) {
            printLayoutBtn.addEventListener('click', this.printLayout.bind(this));
        }
        
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', async () => {
                await this.exportToPDF();
            });
        }
        
        if (zoomFitBtn) {
            zoomFitBtn.addEventListener('click', this.fitToScreen.bind(this));
        }
        
        document.querySelectorAll('.quick-add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const width = e.target.dataset.width;
                const height = e.target.dataset.height;
                if (width && height) {
                    this.quickAddPiece(parseInt(width), parseInt(height));
                }
            });
        });
        
        const languageToggle = document.getElementById('language-toggle');
        const languageDropdown = document.getElementById('language-dropdown');
        
        if (languageToggle) {
            languageToggle.addEventListener('click', () => {
                languageDropdown.classList.toggle('show');
            });
        }
        
        document.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const lang = e.target.closest('.lang-option').dataset.lang;
                this.setLanguage(lang);
                languageDropdown.classList.remove('show');
            });
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector')) {
                languageDropdown?.classList.remove('show');
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.target.id === 'piece-width' || e.target.id === 'piece-height' || e.target.id === 'piece-quantity')) {
                this.addPiece();
            }
        });
        
        const layoutContainer = document.getElementById('layout-container');
        if (layoutContainer) {
            layoutContainer.addEventListener('wheel', this.handleZoom.bind(this));
            layoutContainer.addEventListener('mousedown', this.startPan.bind(this));
            layoutContainer.addEventListener('mousemove', this.handlePan.bind(this));
            layoutContainer.addEventListener('mouseup', this.stopPan.bind(this));
            layoutContainer.addEventListener('mouseleave', this.stopPan.bind(this));
        }
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        this.updateLanguage();
        this.saveSettings();
    }
    
    updateLanguage() {
        const translations = this.translations[this.currentLanguage];
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            if (translations[key]) {
                if (element.tagName === 'INPUT' && element.type !== 'button') {
                    element.placeholder = translations[key];
                } else {
                    element.textContent = translations[key];
                }
            }
        });
        
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.dataset.i18nPlaceholder;
            if (translations[key]) {
                element.placeholder = translations[key];
            }
        });
        
        const currentLangElement = document.getElementById('current-lang');
        if (currentLangElement) {
            currentLangElement.textContent = this.currentLanguage.toUpperCase();
        }
    }
    
    updatePiecePreview() {
        const widthInput = document.getElementById('piece-width');
        const heightInput = document.getElementById('piece-height');
        const previewElement = document.getElementById('piece-preview');
        const previewInfoElement = document.getElementById('preview-info');
        const areaElement = document.getElementById('piece-area');
        const ratioElement = document.getElementById('piece-ratio');
        
        const width = parseFloat(widthInput.value) || 0;
        const height = parseFloat(heightInput.value) || 0;
        
        if (width > 0 && height > 0) {
            const maxPreviewSize = 80;
            const aspectRatio = width / height;
            let previewWidth, previewHeight;
            
            if (aspectRatio > 1) {
                previewWidth = Math.min(maxPreviewSize, width * (maxPreviewSize / Math.max(width, height)));
                previewHeight = previewWidth / aspectRatio;
            } else {
                previewHeight = Math.min(maxPreviewSize, height * (maxPreviewSize / Math.max(width, height)));
                previewWidth = previewHeight * aspectRatio;
            }
            
            previewElement.innerHTML = `
                <div class="piece-preview-shape" style="
                    width: ${previewWidth}px;
                    height: ${previewHeight}px;
                    background: linear-gradient(135deg, #045164ff 0%, #067996ff 100%);
                    border-radius: 4px;
                    border: 1px solid rgba(6, 62, 134, 0.3);
                    position: relative;
                    margin: auto;
                ">
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        color: white;
                        font-size: 10px;
                        font-weight: 500;
                        text-align: center;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                    ">
                        ${width}×${height}
                    </div>
                </div>
            `;
            
            const area = (width * height / 1000000).toFixed(3);
            const ratio = this.calculateRatio(width, height);
            
            areaElement.textContent = `${area} m²`;
            ratioElement.textContent = ratio;
            previewInfoElement.classList.remove('hidden');
        } else {
            previewElement.innerHTML = `
                <div class="preview-placeholder">
                    <svg width="24" height="24" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 4v25h25v-25h-25zM11 28h-7v-17h7v17zM27 28h-15v-8h15v8zM27 19h-15v-8h15v8zM27 10h-23v-5h23v5z"></path>
                    </svg>
                    <span>${this.translations[this.currentLanguage].enter_dimensions}</span>
                </div>
            `;
            previewInfoElement.classList.add('hidden');
        }
        
        this.updateAddButtonState();
    }
    
    calculateRatio(width, height) {
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(width, height);
        return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
    }
    
    updateAddButtonState() {
        const widthInput = document.getElementById('piece-width');
        const heightInput = document.getElementById('piece-height');
        const quantityInput = document.getElementById('piece-quantity');
        const addPieceBtn = document.getElementById('add-piece');
        
        const width = parseFloat(widthInput.value) || 0;
        const height = parseFloat(heightInput.value) || 0;
        const quantity = parseInt(quantityInput.value) || 0;
        
        const isValid = width > 0 && height > 0 && quantity > 0;
        addPieceBtn.disabled = !isValid;
    }
    
    quickAddPiece(width, height) {
        const widthInput = document.getElementById('piece-width');
        const heightInput = document.getElementById('piece-height');
        
        widthInput.value = width;
        heightInput.value = height;
        
        this.updatePiecePreview();
        widthInput.focus();
    }
    
    swapDimensions() {
        const widthInput = document.getElementById('piece-width');
        const heightInput = document.getElementById('piece-height');
        
        const width = widthInput.value;
        const height = heightInput.value;
        
        widthInput.value = height;
        heightInput.value = width;
        
        this.updatePiecePreview();
    }
    
    addPiece() {
        const nameInput = document.getElementById('piece-name');
        const widthInput = document.getElementById('piece-width');
        const heightInput = document.getElementById('piece-height');
        const quantityInput = document.getElementById('piece-quantity');
        
        const name = nameInput.value.trim() || '';
        const width = parseFloat(widthInput.value);
        const height = parseFloat(heightInput.value);
        const quantity = parseInt(quantityInput.value);
        
        if (!width || !height || !quantity || width <= 0 || height <= 0 || quantity <= 0) {
            this.showError('Please enter valid dimensions and quantity');
            return;
        }
        
        const sheetWidth = parseFloat(document.getElementById('sheet-width').value);
        const sheetHeight = parseFloat(document.getElementById('sheet-height').value);
        
        if (width > sheetWidth && height > sheetHeight) {
            this.showError('Piece dimensions exceed sheet size in both orientations');
            return;
        }
        
        let finalWidth = width;
        let finalHeight = height;
        
        if (width > sheetWidth || height > sheetHeight) {
            if (width <= sheetHeight && height <= sheetWidth) {
                const confirmSwap = confirm(`Piece dimensions (${width}×${height}mm) exceed sheet size in current orientation. Would you like to rotate the piece?`);
                if (confirmSwap) {
                    finalWidth = height;
                    finalHeight = width;
                } else {
                    this.showError('Piece dimensions exceed sheet size');
                    return;
                }
            } else {
                this.showError('Piece dimensions exceed sheet size in both orientations');
                return;
            }
        }
        
        const existingPiece = this.pieceList.find(p => p.width === finalWidth && p.height === finalHeight);
        if (existingPiece) {
            existingPiece.quantity += quantity;
            if (name && !existingPiece.name) {
                existingPiece.name = name;
            }
        } else {
            const piece = {
                id: this.nextPieceId++,
                name: name,
                width: finalWidth,
                height: finalHeight,
                quantity: quantity,
                area: finalWidth * finalHeight / 1000000,
                sheetWidth: sheetWidth,
                sheetHeight: sheetHeight
            };
            this.pieceList.push(piece);
        }
        
        nameInput.value = '';
        widthInput.value = '';
        heightInput.value = '';
        quantityInput.value = '1';
        
        this.updatePiecePreview();
        this.updatePiecesList();
        this.updateSummary();
        this.updateCalculateButton();
        
        widthInput.focus();
    }
    
    updatePiecesList() {
        const piecesListElement = document.getElementById('pieces-list');
        
        if (this.pieceList.length === 0) {
            piecesListElement.innerHTML = `
                <div class="empty-state">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    <p>No pieces added yet</p>
                    <small>Add pieces using the form above</small>
                </div>
            `;
            return;
        }
        
        let html = '<div class="pieces-grid">';
        
        this.pieceList.forEach((piece, index) => {
            const totalArea = (piece.width * piece.height * piece.quantity / 1000000).toFixed(3);
            const displayName = piece.name || '';
            
            html += `
                <div class="piece-card" data-piece-id="${piece.id}">
                    <div class="piece-header">
                        <div class="piece-dimensions">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            </svg>
                            <span class="dimensions-text">${piece.width}×${piece.height}mm</span>
                            ${displayName ? `<div class="piece-name">${displayName}</div>` : ''}
                        </div>
                        <div class="piece-actions">
                            <button class="btn-simple btn-add" onclick="addPieceSimple(${piece.width}, ${piece.height}, '${displayName}')" title="Add one more">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 5v14M5 12h14"/>
                                </svg>
                            </button>
                            <button class="btn-simple btn-subtract" onclick="subtractPieceSimple(${index})" title="Remove one" ${piece.quantity <= 1 ? 'disabled' : ''}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M5 12h14"/>
                                </svg>
                            </button>
                            <button class="btn-simple btn-remove-all" onclick="removeAllPiecesSimple(${index})" title="Remove all">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="piece-info">
                        <div class="info-row">
                            <span class="info-label">Count:</span>
                            <span class="info-value">${piece.quantity}</span>
                            <span></span>
                            <span class="info-label">Area:</span>
                            <span class="info-value">${totalArea} m²</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        piecesListElement.innerHTML = html;
    }
    
    groupPiecesByDimensions() {
        const groups = {};
        
        this.pieceList.forEach(piece => {
            const key = `${piece.width}x${piece.height}`;
            if (!groups[key]) {
                groups[key] = {
                    width: piece.width,
                    height: piece.height,
                    count: 0,
                    pieces: []
                };
            }
            groups[key].count += piece.quantity;
            groups[key].pieces.push(piece);
        });
        
        return groups;
    }
    
    updateSummary() {
        const summaryElement = document.getElementById('pieces-summary');
        
        if (this.pieceList.length === 0) {
            summaryElement.classList.add('hidden');
            return;
        }
        
        let totalPieces = 0;
        let totalArea = 0;
        
        this.pieceList.forEach(piece => {
            totalPieces += piece.quantity;
            totalArea += piece.area * piece.quantity;
        });
        
        summaryElement.innerHTML = `
            <div class="summary-stats">
                <div class="stat-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"/>
                        <circle cx="12" cy="12" r="10"/>
                    </svg>
                    <span class="stat-label">Total Pieces:</span>
                    <span class="stat-value">${totalPieces}</span>
                    <span></span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12h6m0 0V6m0 6v6m6-6h6"/>
                    </svg>
                    <span class="stat-label">Total Area:</span>
                    <span class="stat-value">${totalArea.toFixed(3)} m²</span>
                </div>
            </div>
        `;
        summaryElement.classList.remove('hidden');
    }
    
    updateCalculateButton() {
        const calculateBtn = document.getElementById('calculate');
        calculateBtn.disabled = this.pieceList.length === 0;
    }
    
    clearAllPieces() {
        if (this.pieceList.length === 0) return;
        
        const confirmClear = confirm('Are you sure you want to clear all pieces?');
        if (confirmClear) {
            this.pieceList = [];
            this.updatePiecesList();
            this.updateSummary();
            this.updateCalculateButton();
            this.clearResults();
        }
    }
    
    calculateLayout() {
        if (this.pieceList.length === 0) return;
        
        this.showLoading(true);
        
        setTimeout(() => {
            try {
                const sheetWidth = parseFloat(document.getElementById('sheet-width').value);
                const sheetHeight = parseFloat(document.getElementById('sheet-height').value);
                const kerfWidth = parseFloat(document.getElementById('kerf-width').value);
                const algorithm = document.getElementById('algorithm').value;
                
                const layoutFunction = this.algorithms[algorithm] || this.algorithms.maxrects;
                
                this.currentLayout = layoutFunction(
                    this.pieceList,
                    sheetWidth,
                    sheetHeight,
                    kerfWidth
                );
                
                this.displayResults();
                this.updateActionButtons(true);
                
            } catch (error) {
                console.error('Layout calculation error:', error);
                this.showError('Error calculating layout. Please try again.');
            } finally {
                this.showLoading(false);
            }
        }, 100);
    }
    
    maxRectsAlgorithm(pieces, sheetWidth, sheetHeight, kerfWidth) {
        const sheets = [];
        const expandedPieces = [];
        
        pieces.forEach(piece => {
            for (let i = 0; i < piece.quantity; i++) {
                expandedPieces.push({
                    id: `${piece.id}_${i}`,
                    name: piece.name,
                    width: piece.width,
                    height: piece.height,
                    quantity: 1,
                    area: piece.area
                });
            }
        });
        
        const unplacedPieces = [...expandedPieces];
        
        while (unplacedPieces.length > 0) {
            const sheet = {
                id: sheets.length + 1,
                width: sheetWidth,
                height: sheetHeight,
                pieces: [],
                freeRectangles: [{ x: 0, y: 0, width: sheetWidth, height: sheetHeight }]
            };
            
            let piecePlaced = true;
            while (piecePlaced && unplacedPieces.length > 0) {
                piecePlaced = false;
                
                for (let i = 0; i < unplacedPieces.length; i++) {
                    const piece = unplacedPieces[i];
                    const placement = this.findBestRectForPiece(sheet, piece, kerfWidth);
                    
                    if (placement) {
                        piece.x = placement.x;
                        piece.y = placement.y;
                        piece.width = placement.width;
                        piece.height = placement.height;
                        
                        sheet.pieces.push(piece);
                        this.updateFreeRectangles(sheet, placement, kerfWidth);
                        
                        unplacedPieces.splice(i, 1);
                        piecePlaced = true;
                        break;
                    }
                }
            }
            
            sheets.push(sheet);
        }
        
        return this.calculateLayoutStats(sheets, sheetWidth, sheetHeight);
    }
    
    findBestRectForPiece(sheet, piece, kerfWidth) {
        let bestShortSideFit = Number.MAX_VALUE;
        let bestLongSideFit = Number.MAX_VALUE;
        let bestRect = null;
        
        for (const rect of sheet.freeRectangles) {
            const orientations = [
                { width: piece.width, height: piece.height },
                { width: piece.height, height: piece.width }
            ];
            
            for (const orientation of orientations) {
                const requiredWidth = orientation.width + kerfWidth;
                const requiredHeight = orientation.height + kerfWidth;
                
                if (requiredWidth <= rect.width && requiredHeight <= rect.height) {
                    const leftoverWidth = rect.width - requiredWidth;
                    const leftoverHeight = rect.height - requiredHeight;
                    const shortSideFit = Math.min(leftoverWidth, leftoverHeight);
                    const longSideFit = Math.max(leftoverWidth, leftoverHeight);
                    
                    if (shortSideFit < bestShortSideFit || 
                        (shortSideFit === bestShortSideFit && longSideFit < bestLongSideFit)) {
                        bestRect = {
                            x: rect.x,
                            y: rect.y,
                            width: orientation.width,
                            height: orientation.height
                        };
                        bestShortSideFit = shortSideFit;
                        bestLongSideFit = longSideFit;
                    }
                }
            }
        }
        
        return bestRect;
    }
    
    updateFreeRectangles(sheet, usedRect, kerfWidth) {
        const newFreeRects = [];
        const usedRectWithKerf = {
            x: usedRect.x,
            y: usedRect.y,
            width: usedRect.width + kerfWidth,
            height: usedRect.height + kerfWidth
        };
        
        for (const rect of sheet.freeRectangles) {
            if (!this.rectanglesIntersect(rect, usedRectWithKerf)) {
                newFreeRects.push(rect);
                continue;
            }
            
            if (usedRectWithKerf.x > rect.x && usedRectWithKerf.x < rect.x + rect.width) {
                newFreeRects.push({
                    x: rect.x,
                    y: rect.y,
                    width: usedRectWithKerf.x - rect.x,
                    height: rect.height
                });
            }
            
            if (usedRectWithKerf.x + usedRectWithKerf.width < rect.x + rect.width) {
                newFreeRects.push({
                    x: usedRectWithKerf.x + usedRectWithKerf.width,
                    y: rect.y,
                    width: rect.x + rect.width - (usedRectWithKerf.x + usedRectWithKerf.width),
                    height: rect.height
                });
            }
            
            if (usedRectWithKerf.y > rect.y && usedRectWithKerf.y < rect.y + rect.height) {
                newFreeRects.push({
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: usedRectWithKerf.y - rect.y
                });
            }
            
            if (usedRectWithKerf.y + usedRectWithKerf.height < rect.y + rect.height) {
                newFreeRects.push({
                    x: rect.x,
                    y: usedRectWithKerf.y + usedRectWithKerf.height,
                    width: rect.width,
                    height: rect.y + rect.height - (usedRectWithKerf.y + usedRectWithKerf.height)
                });
            }
        }
        
        sheet.freeRectangles = this.pruneFreeRectangles(newFreeRects);
    }
    
    rectanglesIntersect(rect1, rect2) {
        return !(rect1.x >= rect2.x + rect2.width ||
                rect1.x + rect1.width <= rect2.x ||
                rect1.y >= rect2.y + rect2.height ||
                rect1.y + rect1.height <= rect2.y);
    }
    
    pruneFreeRectangles(freeRects) {
        const prunedRects = [];
        
        for (let i = 0; i < freeRects.length; i++) {
            let isContained = false;
            
            for (let j = 0; j < freeRects.length; j++) {
                if (i === j) continue;
                
                if (this.rectangleContains(freeRects[j], freeRects[i])) {
                    isContained = true;
                    break;
                }
            }
            
            if (!isContained) {
                prunedRects.push(freeRects[i]);
            }
        }
        
        return prunedRects;
    }
    
    rectangleContains(container, contained) {
        return container.x <= contained.x &&
               container.y <= contained.y &&
               container.x + container.width >= contained.x + contained.width &&
               container.y + container.height >= contained.y + contained.height;
    }
    
    guillotineAlgorithm(pieces, sheetWidth, sheetHeight, kerfWidth) {
        const sheets = [];
        const unplacedPieces = [...pieces];
        
        while (unplacedPieces.length > 0) {
            const sheet = {
                id: sheets.length + 1,
                width: sheetWidth,
                height: sheetHeight,
                pieces: [],
                freeRectangles: [{ x: 0, y: 0, width: sheetWidth, height: sheetHeight }]
            };
            
            let piecePlaced = true;
            while (piecePlaced && unplacedPieces.length > 0) {
                piecePlaced = false;
                
                for (let i = 0; i < unplacedPieces.length; i++) {
                    const piece = unplacedPieces[i];
                    const placement = this.findBestAreaFit(sheet, piece, kerfWidth);
                    
                    if (placement) {
                        piece.x = placement.x;
                        piece.y = placement.y;
                        piece.width = placement.width;
                        piece.height = placement.height;
                        
                        sheet.pieces.push(piece);
                        this.splitFreeRectangle(sheet, placement, kerfWidth);
                        
                        unplacedPieces.splice(i, 1);
                        piecePlaced = true;
                        break;
                    }
                }
            }
            
            sheets.push(sheet);
        }
        
        return this.calculateLayoutStats(sheets, sheetWidth, sheetHeight);
    }
    
    findBestAreaFit(sheet, piece, kerfWidth) {
        let bestAreaFit = Number.MAX_VALUE;
        let bestRect = null;
        
        for (const rect of sheet.freeRectangles) {
            const orientations = [
                { width: piece.width, height: piece.height },
                { width: piece.height, height: piece.width }
            ];
            
            for (const orientation of orientations) {
                const requiredWidth = orientation.width + kerfWidth;
                const requiredHeight = orientation.height + kerfWidth;
                
                if (requiredWidth <= rect.width && requiredHeight <= rect.height) {
                    const areaFit = rect.width * rect.height - requiredWidth * requiredHeight;
                    
                    if (areaFit < bestAreaFit) {
                        bestRect = {
                            x: rect.x,
                            y: rect.y,
                            width: orientation.width,
                            height: orientation.height,
                            rectIndex: sheet.freeRectangles.indexOf(rect)
                        };
                        bestAreaFit = areaFit;
                    }
                }
            }
        }
        
        return bestRect;
    }
    
    splitFreeRectangle(sheet, usedRect, kerfWidth) {
        const rectToSplit = sheet.freeRectangles[usedRect.rectIndex];
        sheet.freeRectangles.splice(usedRect.rectIndex, 1);
        
        const usedWidth = usedRect.width + kerfWidth;
        const usedHeight = usedRect.height + kerfWidth;
        
        const rightWidth = rectToSplit.width - usedWidth;
        const bottomHeight = rectToSplit.height - usedHeight;
        
        if (rightWidth > 0) {
            sheet.freeRectangles.push({
                x: rectToSplit.x + usedWidth,
                y: rectToSplit.y,
                width: rightWidth,
                height: rectToSplit.height
            });
        }
        
        if (bottomHeight > 0) {
            sheet.freeRectangles.push({
                x: rectToSplit.x,
                y: rectToSplit.y + usedHeight,
                width: usedWidth,
                height: bottomHeight
            });
        }
    }
    
    bottomLeftAlgorithm(pieces, sheetWidth, sheetHeight, kerfWidth) {
        const sheets = [];
        const unplacedPieces = [...pieces];
        
        while (unplacedPieces.length > 0) {
            const sheet = {
                id: sheets.length + 1,
                width: sheetWidth,
                height: sheetHeight,
                pieces: []
            };
            
            let piecePlaced = true;
            while (piecePlaced && unplacedPieces.length > 0) {
                piecePlaced = false;
                
                for (let i = 0; i < unplacedPieces.length; i++) {
                    const piece = unplacedPieces[i];
                    const placement = this.findBottomLeftPosition(sheet, piece, kerfWidth);
                    
                    if (placement) {
                        piece.x = placement.x;
                        piece.y = placement.y;
                        piece.width = placement.width;
                        piece.height = placement.height;
                        
                        sheet.pieces.push(piece);
                        unplacedPieces.splice(i, 1);
                        piecePlaced = true;
                        break;
                    }
                }
            }
            
            sheets.push(sheet);
        }
        
        return this.calculateLayoutStats(sheets, sheetWidth, sheetHeight);
    }
    
    findBottomLeftPosition(sheet, piece, kerfWidth) {
        const orientations = [
            { width: piece.width, height: piece.height },
            { width: piece.height, height: piece.width }
        ];
        
        let bestPosition = null;
        let bestY = Number.MAX_VALUE;
        let bestX = Number.MAX_VALUE;
        
        for (const orientation of orientations) {
            const requiredWidth = orientation.width + kerfWidth;
            const requiredHeight = orientation.height + kerfWidth;
            
            if (requiredWidth > sheet.width || requiredHeight > sheet.height) continue;
            
            for (let y = 0; y <= sheet.height - requiredHeight; y++) {
                for (let x = 0; x <= sheet.width - requiredWidth; x++) {
                    const newRect = { x, y, width: orientation.width, height: orientation.height };
                    
                    if (!this.rectangleOverlapsWithPieces(sheet, newRect, kerfWidth)) {
                        if (y < bestY || (y === bestY && x < bestX)) {
                            bestPosition = newRect;
                            bestY = y;
                            bestX = x;
                        }
                    }
                }
            }
        }
        
        return bestPosition;
    }
    
    rectangleOverlapsWithPieces(sheet, newRect, kerfWidth) {
        const newRectWithKerf = {
            x: newRect.x,
            y: newRect.y,
            width: newRect.width + kerfWidth,
            height: newRect.height + kerfWidth
        };
        
        for (const piece of sheet.pieces) {
            const pieceWithKerf = {
                x: piece.x,
                y: piece.y,
                width: piece.width + kerfWidth,
                height: piece.height + kerfWidth
            };
            
            if (this.rectanglesIntersect(newRectWithKerf, pieceWithKerf)) {
                return true;
            }
        }
        
        return false;
    }
    
    bestFitAlgorithm(pieces, sheetWidth, sheetHeight, kerfWidth) {
        const sheets = [];
        const sortedPieces = [...pieces].sort((a, b) => {
            const areaA = a.width * a.height;
            const areaB = b.width * b.height;
            return areaB - areaA;
        });
        
        while (sortedPieces.length > 0) {
            const sheet = {
                id: sheets.length + 1,
                width: sheetWidth,
                height: sheetHeight,
                pieces: []
            };
            
            let piecePlaced = true;
            while (piecePlaced && sortedPieces.length > 0) {
                piecePlaced = false;
                
                for (let i = 0; i < sortedPieces.length; i++) {
                    const piece = sortedPieces[i];
                    const placement = this.findBottomLeftPosition(sheet, piece, kerfWidth);
                    
                    if (placement) {
                        piece.x = placement.x;
                        piece.y = placement.y;
                        piece.width = placement.width;
                        piece.height = placement.height;
                        
                        sheet.pieces.push(piece);
                        sortedPieces.splice(i, 1);
                        piecePlaced = true;
                        break;
                    }
                }
            }
            
            sheets.push(sheet);
        }
        
        return this.calculateLayoutStats(sheets, sheetWidth, sheetHeight);
    }
    
    calculateLayoutStats(sheets, sheetWidth, sheetHeight) {
        const sheetArea = sheetWidth * sheetHeight / 1000000;
        let totalUsedArea = 0;
        let totalWasteArea = 0;
        
        sheets.forEach(sheet => {
            let sheetUsedArea = 0;
            sheet.pieces.forEach(piece => {
                sheetUsedArea += piece.width * piece.height / 1000000;
            });
            
            totalUsedArea += sheetUsedArea;
            totalWasteArea += sheetArea - sheetUsedArea;
        });
        
        const totalSheetArea = sheets.length * sheetArea;
        const utilization = (totalUsedArea / totalSheetArea) * 100;
        const wastePercentage = (totalWasteArea / totalSheetArea) * 100;
        
        return {
            sheets,
            stats: {
                sheetsUsed: sheets.length,
                totalUsedArea: totalUsedArea.toFixed(3),
                totalWasteArea: totalWasteArea.toFixed(3),
                utilization: utilization.toFixed(1),
                wastePercentage: wastePercentage.toFixed(1),
                efficiency: utilization.toFixed(1)
            }
        };
    }
    
    displayResults() {
        this.updateResultsStats();
        this.renderLayout();
        this.showResultsPanel(true);
    }
    
    updateResultsStats() {
        if (!this.currentLayout) return;
        
        const stats = this.currentLayout.stats;
        document.getElementById('stat-sheets').textContent = stats.sheetsUsed;
        document.getElementById('stat-used').textContent = `${stats.utilization}%`;
        document.getElementById('stat-waste').textContent = `${stats.wastePercentage}%`;
        document.getElementById('stat-efficiency').textContent = `${stats.efficiency}%`;
    }
    
    renderLayout() {
        const container = document.getElementById('layout-container');
        const noResults = document.getElementById('no-results');
        const layoutControls = document.getElementById('layout-controls');
        
        noResults.style.display = 'none';
        
        if (!this.currentLayout || this.currentLayout.sheets.length === 0) {
            noResults.style.display = 'block';
            layoutControls.classList.add('hidden');
            return;
        }
        
        // Show layout controls when we have results
        layoutControls.classList.remove('hidden');
        
        let html = '<div class="sheets-container">';
        
        this.currentLayout.sheets.forEach((sheet, index) => {
            html += this.renderSheet(sheet, index);
        });
        
        html += '</div>';
        
        // Insert HTML after layout controls
        const sheetsContainer = container.querySelector('.sheets-container');
        if (sheetsContainer) {
            sheetsContainer.innerHTML = html.replace('<div class="sheets-container">', '').replace('</div>', '');
        } else {
            const layoutControlsDiv = container.querySelector('.layout-controls');
            layoutControlsDiv.insertAdjacentHTML('afterend', html);
        }
        
        this.setupLayoutInteractions();
    }
    
    renderSheet(sheet, index) {
        const scale = Math.min(400 / sheet.width, 300 / sheet.height);
        const scaledWidth = sheet.width * scale;
        const scaledHeight = sheet.height * scale;
        
        let html = `
            <div class="sheet-layout" data-sheet-id="${sheet.id}">
                <div class="sheet-header">
                    <h4>Sheet ${index + 1}</h4>
                    <div class="sheet-info">
                        <span>${sheet.pieces.length} pieces</span>
                    </div>
                </div>
                <div class="sheet-container" style="width: ${scaledWidth}px; height: ${scaledHeight}px;">
                    <svg width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${sheet.width} ${sheet.height}" class="sheet-svg">
                        <rect width="${sheet.width}" height="${sheet.height}" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
        `;
        
        const colors = ['#4f46e5', '#7c3aed', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#c2410c'];
        
        sheet.pieces.forEach((piece, pieceIndex) => {
            const color = colors[pieceIndex % colors.length];
            const textColor = '#ffffff';
            const text = piece.name || `${piece.width}×${piece.height}`;
            
            // Calculate optimal font size and rotation for text
            const textInfo = this.calculateOptimalText(piece, text);
            
            html += `
                <g class="piece-group" data-piece-id="${piece.id}">
                    <rect x="${piece.x}" y="${piece.y}" width="${piece.width}" height="${piece.height}" 
                          fill="${color}" stroke="#fff" stroke-width="1" opacity="0.9"/>
                    <text x="${textInfo.x}" y="${textInfo.y}" 
                          text-anchor="middle" dominant-baseline="middle" fill="${textColor}" 
                          font-size="${Math.max(14, textInfo.fontSize)}" font-weight="600"
                          transform="${textInfo.transform}">
                        ${textInfo.displayText}
                    </text>
                </g>
            `;
        });
        
        html += `
                    </svg>
                </div>
                <div class="sheet-stats">
                    <div class="stat">
                        <span class="label">Pieces:</span>
                        <span class="value">${sheet.pieces.length}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Used:</span>
                        <span class="value">${this.calculateSheetUtilization(sheet).toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }
    
    calculateOptimalText(piece, text) {
        const centerX = piece.x + piece.width / 2;
        const centerY = piece.y + piece.height / 2;
        
        // Estimate text width (rough approximation: 0.6 * fontSize per character)
        const estimateTextWidth = (text, fontSize) => text.length * fontSize * 0.6;
        
        // Increased font sizes for better readability
        // Try horizontal text first
        let maxFontSize = Math.min(piece.width / 6, piece.height / 2.5, 28); // Increased from 20 to 28
        let minFontSize = 12; // Increased from 8 to 12
        let fontSize = Math.max(minFontSize, Math.min(maxFontSize, piece.width / text.length * 1.5)); // Increased multiplier
        
        // Check if horizontal text fits
        if (estimateTextWidth(text, fontSize) <= piece.width * 0.85 && fontSize >= minFontSize) { // Slightly tighter fit
            return {
                x: centerX,
                y: centerY,
                fontSize: Math.max(minFontSize, fontSize),
                transform: '',
                displayText: text
            };
        }
        
        // Try vertical text (rotated 90 degrees)
        let verticalFontSize = Math.min(piece.height / 6, piece.width / 2.5, 28); // Increased
        verticalFontSize = Math.max(minFontSize, Math.min(verticalFontSize, piece.height / text.length * 1.5)); // Increased multiplier
        
        if (estimateTextWidth(text, verticalFontSize) <= piece.height * 0.85 && verticalFontSize >= minFontSize) { // Tighter fit
            return {
                x: centerX,
                y: centerY,
                fontSize: Math.max(minFontSize, verticalFontSize),
                transform: `rotate(-90 ${centerX} ${centerY})`,
                displayText: text
            };
        }
        
        // If still doesn't fit, use smallest readable size horizontally
        let finalFontSize = Math.max(minFontSize, Math.min(piece.width / text.length * 1.0, piece.height / 3)); // Better scaling
        
        // If text is still too long, truncate it
        let displayText = text;
        if (estimateTextWidth(text, finalFontSize) > piece.width * 0.85) {
            // Try to fit by truncating text
            const maxChars = Math.floor(piece.width * 0.85 / (finalFontSize * 0.6));
            if (maxChars < text.length) {
                displayText = text.substring(0, Math.max(3, maxChars - 2)) + '..';
            }
        }
        
        return {
            x: centerX,
            y: centerY,
            fontSize: finalFontSize,
            transform: '',
            displayText: displayText
        };
    }
    
    calculateSheetUtilization(sheet) {
        const sheetArea = sheet.width * sheet.height;
        let usedArea = 0;
        
        sheet.pieces.forEach(piece => {
            usedArea += piece.width * piece.height;
        });
        
        return (usedArea / sheetArea) * 100;
    }
    
    setupLayoutInteractions() {
        // Setup piece hover effects
        document.querySelectorAll('.piece-group').forEach(group => {
            group.addEventListener('mouseenter', (e) => {
                const pieceId = e.target.closest('.piece-group').dataset.pieceId;
                this.highlightPiece(pieceId, true);
            });
            
            group.addEventListener('mouseleave', (e) => {
                const pieceId = e.target.closest('.piece-group').dataset.pieceId;
                this.highlightPiece(pieceId, false);
            });
        });
        
        // Setup layout controls
        this.setupLayoutControls();
    }
    
    setupLayoutControls() {
        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');
        const fitScreenBtn = document.getElementById('fit-screen-btn');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => this.zoomLayout(1.2));
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => this.zoomLayout(0.8));
        }
        
        if (fitScreenBtn) {
            fitScreenBtn.addEventListener('click', () => this.fitToScreen());
        }
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
    }
    
    zoomLayout(factor) {
        const sheetsContainer = document.querySelector('.sheets-container');
        if (!sheetsContainer) return;
        
        const currentScale = parseFloat(sheetsContainer.dataset.scale || 1);
        const newScale = Math.max(0.5, Math.min(3, currentScale * factor));
        
        sheetsContainer.style.transform = `scale(${newScale})`;
        sheetsContainer.dataset.scale = newScale;
    }
    
    fitToScreen() {
        const sheetsContainer = document.querySelector('.sheets-container');
        if (!sheetsContainer) return;
        
        sheetsContainer.style.transform = 'scale(1)';
        sheetsContainer.dataset.scale = '1';
        
        // Scroll to top
        sheetsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    toggleFullscreen() {
        const layoutContainer = document.getElementById('layout-container');
        
        if (!document.fullscreenElement) {
            layoutContainer.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    highlightPiece(pieceId, highlight) {
        const pieceElements = document.querySelectorAll(`[data-piece-id="${pieceId}"]`);
        pieceElements.forEach(element => {
            if (highlight) {
                element.classList.add('highlighted');
            } else {
                element.classList.remove('highlighted');
            }
        });
    }
    
    showResultsPanel(show) {
        const resultsSummary = document.getElementById('results-summary');
        if (show) {
            resultsSummary.classList.remove('hidden');
        } else {
            resultsSummary.classList.add('hidden');
        }
    }
    
    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }
    
    updateActionButtons(enabled) {
        const printBtn = document.getElementById('print-layout');
        const exportBtn = document.getElementById('export-pdf');
        const zoomBtn = document.getElementById('zoom-fit');
        
        if (printBtn) {
            printBtn.disabled = !enabled;
            printBtn.style.opacity = enabled ? '1' : '0.5';
        }
        
        if (exportBtn) {
            exportBtn.disabled = !enabled;
            exportBtn.style.opacity = enabled ? '1' : '0.5';
        }
        
        if (zoomBtn) {
            zoomBtn.disabled = !enabled;
            zoomBtn.style.opacity = enabled ? '1' : '0.5';
        }
    }
    
    clearResults() {
        this.currentLayout = null;
        
        // Show no-results section
        const noResults = document.getElementById('no-results');
        if (noResults) {
            noResults.style.display = 'block';
        }
        
        // Hide layout controls
        const layoutControls = document.getElementById('layout-controls');
        if (layoutControls) {
            layoutControls.classList.add('hidden');
        }
        
        // Clear sheets container
        const sheetsContainer = document.querySelector('.sheets-container');
        if (sheetsContainer) {
            sheetsContainer.remove();
        }
        
        // Hide results panel and disable action buttons
        this.showResultsPanel(false);
        this.updateActionButtons(false);
    }
    
    handleZoom(event) {
        event.preventDefault();
        
        const delta = event.deltaY > 0 ? 0.9 : 1.1;
        this.scale *= delta;
        this.scale = Math.max(0.1, Math.min(5, this.scale));
        
        this.applyTransform();
    }
    
    startPan(event) {
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        event.target.style.cursor = 'grabbing';
    }
    
    handlePan(event) {
        if (!this.isDragging) return;
        
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        
        this.panX += deltaX;
        this.panY += deltaY;
        
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        
        this.applyTransform();
    }
    
    stopPan(event) {
        this.isDragging = false;
        event.target.style.cursor = 'grab';
    }
    
    applyTransform() {
        const container = document.querySelector('.sheets-container');
        if (container) {
            container.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
        }
    }
    
    fitToScreen() {
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.applyTransform();
    }
    
    printLayout() {
        if (!this.currentLayout) {
            this.showError('No layout to print. Please calculate optimization first.');
            return;
        }
        
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                this.showError('Unable to open print window. Please check popup settings.');
                return;
            }
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Cutting Layout - ${new Date().toLocaleDateString()}</title>
                    <meta charset="UTF-8">
                    <style>
                        * { box-sizing: border-box; }
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 0; 
                            padding: 8px; 
                            line-height: 1.3; 
                            font-size: 12px;
                        }
                        
                        .print-container {
                            width: 100%;
                            max-width: 100%;
                        }
                        
                        .summary-header {
                            background: #f0f0f0;
                            padding: 8px;
                            margin-bottom: 10px;
                            border-radius: 4px;
                            font-size: 11px;
                        }
                        
                        .summary-header h1 {
                            margin: 0 0 5px 0;
                            font-size: 16px;
                        }
                        
                        .summary-stats {
                            display: flex;
                            justify-content: space-between;
                            flex-wrap: wrap;
                            gap: 10px;
                        }
                        
                        .sheets-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 10px;
                            width: 100%;
                        }
                        
                        .sheet-item {
                            break-inside: avoid;
                            page-break-inside: avoid;
                            margin-bottom: 8px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            overflow: hidden;
                        }
                        
                        .sheet-header {
                            background: #f8f9fa;
                            padding: 6px 8px;
                            font-weight: bold;
                            font-size: 11px;
                            border-bottom: 1px solid #ddd;
                            display: flex;
                            justify-content: space-between;
                        }
                        
                        .sheet-diagram {
                            padding: 8px;
                            text-align: center;
                            background: white;
                        }
                        
                        .sheet-svg {
                            max-width: 100%;
                            height: auto;
                            border: 1px solid #ccc;
                        }
                        
                        .piece-list {
                            padding: 6px 8px;
                            background: #fafafa;
                            font-size: 9px;
                            line-height: 1.2;
                        }
                        
                        .piece-item {
                            margin: 2px 0;
                        }
                        
                        /* Large sheets get full width */
                        .sheet-item.large {
                            grid-column: 1 / -1;
                        }
                        
                        .sheet-item.large .sheets-grid {
                            grid-template-columns: 1fr;
                        }
                        
                        @media print {
                            body { 
                                margin: 5mm;
                                padding: 0;
                                font-size: 10px;
                            }
                            
                            .summary-header {
                                margin-bottom: 5px;
                                padding: 5px;
                            }
                            
                            .sheets-grid {
                                gap: 5px;
                            }
                            
                            .sheet-item {
                                margin-bottom: 5px;
                            }
                            
                            .sheet-header {
                                padding: 4px 6px;
                                font-size: 10px;
                            }
                            
                            .sheet-diagram {
                                padding: 5px;
                            }
                            
                            .piece-list {
                                padding: 4px 6px;
                                font-size: 8px;
                            }
                            
                            /* Fit more content per page */
                            .page-break {
                                page-break-before: always;
                            }
                        }
                        
                        /* Mobile/small screen adjustments */
                        @media (max-width: 600px) {
                            .sheets-grid {
                                grid-template-columns: 1fr;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        <div class="summary-header">
                            <h1>Cutting Layout</h1>
                            <div class="summary-stats">
                                <span><strong>Generated:</strong> ${new Date().toLocaleString()}</span>
                                <span><strong>Sheets:</strong> ${this.currentLayout.stats.sheetsUsed}</span>
                                <span><strong>Utilization:</strong> ${this.currentLayout.stats.utilization}%</span>
                                <span><strong>Waste:</strong> ${this.currentLayout.stats.wastePercentage}%</span>
                            </div>
                        </div>
                        ${this.generateOptimizedPrintHTML()}
                    </div>
                </body>
                </html>
            `);
            
            printWindow.document.close();
            
            // Wait for content to load before printing
            setTimeout(() => {
                printWindow.print();
            }, 500);
            
        } catch (error) {
            console.error('Print error:', error);
            this.showError('Failed to print layout: ' + error.message);
        }
    }
    
    generateOptimizedPrintHTML() {
        if (!this.currentLayout || !this.currentLayout.sheets) {
            return '<p>No sheets to display</p>';
        }
        
        // Group sheets by size to optimize layout
        const sheets = this.currentLayout.sheets.map((sheet, index) => ({
            ...sheet,
            index,
            isLarge: sheet.pieces.length > 8 || (sheet.width * sheet.height) > 500000,
            complexity: this.calculateSheetComplexity(sheet)
        }));
        
        // Sort by complexity - simpler sheets first for better packing
        sheets.sort((a, b) => a.complexity - b.complexity);
        
        let html = '<div class="sheets-grid">';
        let currentRow = [];
        let pageItemCount = 0;
        const maxItemsPerPage = 6; // Adjust based on testing
        
        sheets.forEach((sheet, idx) => {
            // Add page break if we have too many items
            if (pageItemCount >= maxItemsPerPage && idx > 0) {
                html += '</div><div class="page-break"></div><div class="sheets-grid">';
                pageItemCount = 0;
            }
            
            const sheetClass = sheet.isLarge ? 'large' : '';
            const sheetSvg = this.renderCompactSheetForPrint(sheet, sheet.index);
            const piecesList = this.generateCompactPiecesList(sheet);
            
            html += `
                <div class="sheet-item ${sheetClass}">
                    <div class="sheet-header">
                        <span>Sheet ${sheet.index + 1}</span>
                        <span>${sheet.pieces.length} pieces | ${this.calculateSheetUtilization(sheet).toFixed(1)}%</span>
                    </div>
                    <div class="sheet-diagram">
                        ${sheetSvg}
                    </div>
                    <div class="piece-list">
                        ${piecesList}
                    </div>
                </div>
            `;
            
            pageItemCount += sheet.isLarge ? 2 : 1; // Large sheets count as 2 items
        });
        
        html += '</div>';
        return html;
    }
    
    calculateSheetComplexity(sheet) {
        // Simple complexity calculation based on pieces count and area
        const pieceCount = sheet.pieces.length;
        const totalArea = sheet.width * sheet.height;
        const avgPieceSize = sheet.pieces.reduce((sum, p) => sum + (p.width * p.height), 0) / pieceCount;
        
        return pieceCount * 0.3 + (totalArea / 10000) * 0.4 + (avgPieceSize / 1000) * 0.3;
    }
    
    renderCompactSheetForPrint(sheet, index) {
        // Smaller scale for print optimization
        const maxWidth = 280;
        const maxHeight = 200;
        const scale = Math.min(maxWidth / sheet.width, maxHeight / sheet.height, 0.8);
        const scaledWidth = sheet.width * scale;
        const scaledHeight = sheet.height * scale;
        
        const colors = ['#4f46e5', '#7c3aed', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#c2410c'];
        
        let svg = `<svg width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${sheet.width} ${sheet.height}" class="sheet-svg">
            <rect width="${sheet.width}" height="${sheet.height}" fill="#f8f9fa" stroke="#333" stroke-width="2"/>`;
        
        sheet.pieces.forEach((piece, pieceIndex) => {
            const color = colors[pieceIndex % colors.length];
            const text = piece.name || `${piece.width}×${piece.height}`;
            const textInfo = this.calculateOptimalText(piece, text);
            
            svg += `
                <g class="piece-group">
                    <rect x="${piece.x}" y="${piece.y}" width="${piece.width}" height="${piece.height}" 
                          fill="${color}" stroke="#fff" stroke-width="2" opacity="0.8"/>
                    <text x="${textInfo.x}" y="${textInfo.y}" 
                          text-anchor="middle" dominant-baseline="middle" fill="white" 
                          font-size="${Math.max(12, textInfo.fontSize)}" font-weight="bold"
                          transform="${textInfo.transform}">
                        ${textInfo.displayText}
                    </text>
                </g>
            `;
        });
        
        svg += '</svg>';
        return svg;
    }
    
    generateCompactPiecesList(sheet) {
        if (!sheet.pieces || sheet.pieces.length === 0) return '';
        
        // Group pieces by size to save space
        const groupedPieces = {};
        sheet.pieces.forEach((piece, index) => {
            const key = `${piece.width}×${piece.height}`;
            if (!groupedPieces[key]) {
                groupedPieces[key] = [];
            }
            groupedPieces[key].push({ ...piece, displayIndex: index + 1 });
        });
        
        let html = '';
        Object.entries(groupedPieces).forEach(([size, pieces]) => {
            const names = pieces.map(p => p.name || `#${p.displayIndex}`).join(', ');
            const count = pieces.length > 1 ? ` (${pieces.length}x)` : '';
            html += `<div class="piece-item">${size}mm${count}: ${names}</div>`;
        });
        
        return html;
    }
    
    // Keep the original function as backup for detailed printing  
    generateDetailedPrintHTML() {
        if (!this.currentLayout || !this.currentLayout.sheets) {
            return '<p>No sheets to display</p>';
        }
        
        let html = '';
        
        this.currentLayout.sheets.forEach((sheet, index) => {
            const sheetSvg = this.renderSheetForPrint(sheet, index);
            html += `
                <div class="sheet">
                    <div class="sheet-title">Sheet ${index + 1} (${sheet.pieces.length} pieces)</div>
                    <div class="sheet-container">
                        ${sheetSvg}
                    </div>
                    <div class="stats">
                        Utilization: ${this.calculateSheetUtilization(sheet).toFixed(1)}%
                    </div>
                </div>
            `;
        });
        
        return html;
    }
    
    renderSheetForPrint(sheet, index) {
        const scale = Math.min(600 / sheet.width, 400 / sheet.height);
        const scaledWidth = sheet.width * scale;
        const scaledHeight = sheet.height * scale;
        
        const colors = ['#4f46e5', '#7c3aed', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#c2410c'];
        
        let svg = `<svg width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${sheet.width} ${sheet.height}" class="sheet-svg">
            <rect width="${sheet.width}" height="${sheet.height}" fill="#f8f9fa" stroke="#333" stroke-width="2"/>`;
        
        sheet.pieces.forEach((piece, pieceIndex) => {
            const color = colors[pieceIndex % colors.length];
            const text = piece.name || `${piece.width}×${piece.height}`;
            const textInfo = this.calculateOptimalText(piece, text);
            
            svg += `
                <g class="piece-group">
                    <rect x="${piece.x}" y="${piece.y}" width="${piece.width}" height="${piece.height}" 
                          fill="${color}" stroke="#fff" stroke-width="2" opacity="0.8"/>
                    <text x="${textInfo.x}" y="${textInfo.y}" 
                          text-anchor="middle" dominant-baseline="middle" fill="white" 
                          font-size="${Math.max(14, textInfo.fontSize)}" font-weight="bold"
                          transform="${textInfo.transform}">
                        ${textInfo.displayText}
                    </text>
                </g>
            `;
        });
        
        svg += '</svg>';
        return svg;
    }
    
    createSVGElementForPDF(sheet, index) {
        // Calculate scale for good quality
        const scale = Math.min(600 / sheet.width, 400 / sheet.height);
        const scaledWidth = Math.round(sheet.width * scale);
        const scaledHeight = Math.round(sheet.height * scale);
        
        const colors = ['#4f46e5', '#7c3aed', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#c2410c'];
        
        // Create SVG element with proper namespace and styles
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.setAttribute('width', scaledWidth);
        svgElement.setAttribute('height', scaledHeight);
        svgElement.setAttribute('viewBox', `0 0 ${sheet.width} ${sheet.height}`);
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgElement.style.cssText = 'position: absolute; top: -9999px; left: -9999px; font-family: Arial, sans-serif;';
        
        // Add CSS styles for better font rendering
        const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleElement.textContent = `
            text {
                font-family: Arial, sans-serif;
                font-smooth: always;
                -webkit-font-smoothing: antialiased;
                text-rendering: optimizeLegibility;
            }
        `;
        svgElement.appendChild(styleElement);
        
        // Background rectangle
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('width', sheet.width);
        bgRect.setAttribute('height', sheet.height);
        bgRect.setAttribute('fill', '#f8f9fa');
        bgRect.setAttribute('stroke', '#333');
        bgRect.setAttribute('stroke-width', '2');
        svgElement.appendChild(bgRect);
        
        // Add pieces
        sheet.pieces.forEach((piece, pieceIndex) => {
            const color = colors[pieceIndex % colors.length];
            const text = piece.name || `${piece.width}×${piece.height}`;
            const textInfo = this.calculateOptimalText(piece, text);
            
            // Piece rectangle
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', piece.x);
            rect.setAttribute('y', piece.y);
            rect.setAttribute('width', piece.width);
            rect.setAttribute('height', piece.height);
            rect.setAttribute('fill', color);
            rect.setAttribute('stroke', '#fff');
            rect.setAttribute('stroke-width', '2');
            rect.setAttribute('opacity', '0.9');
            svgElement.appendChild(rect);
            
            // Text element
            const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textEl.setAttribute('x', textInfo.x);
            textEl.setAttribute('y', textInfo.y);
            textEl.setAttribute('text-anchor', 'middle');
            textEl.setAttribute('dominant-baseline', 'middle');
            textEl.setAttribute('fill', 'white');
            textEl.setAttribute('font-size', Math.max(14, textInfo.fontSize));
            textEl.setAttribute('font-weight', 'bold');
            textEl.setAttribute('font-family', 'Arial, sans-serif');
            textEl.style.fontFamily = 'Arial, sans-serif';
            textEl.setAttribute('font-family', 'Arial, sans-serif');
            if (textInfo.transform) {
                textEl.setAttribute('transform', textInfo.transform);
            }
            textEl.textContent = textInfo.displayText;
            svgElement.appendChild(textEl);
        });
        
        // Add to document temporarily
        document.body.appendChild(svgElement);
        
        return {
            svgElement,
            width: scaledWidth,
            height: scaledHeight
        };
    }
    
    async exportToPDF() {
        if (!this.currentLayout) {
            this.showError('No layout to export. Please calculate optimization first.');
            return;
        }

        // Check if required libraries are available
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            this.showError('PDF export library is not loaded. Please refresh the page and try again.');
            return;
        }

        // svg2pdf is loaded as extension to jsPDF, no need to check for window.svg2pdf

        try {
            // Show loading indicator
            this.showError('Generating PDF with SVG diagrams... Please wait.');
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape for better layout view
            
            // Set default font for better text rendering
            pdf.setFont('helvetica', 'normal');
            let yPos = 10;
            // Process each sheet
            for (let sheetIndex = 0; sheetIndex < this.currentLayout.sheets.length; sheetIndex++) {
                const sheet = this.currentLayout.sheets[sheetIndex];
                
                // Add new page for each sheet
                if (sheetIndex > 0 || yPos > 100) {
                    pdf.addPage('l'); // landscape
                }
                
                // Sheet header
                pdf.setFontSize(16);
                pdf.text(`Sheet ${sheetIndex + 1}`, 20, 30);
                
                pdf.setFontSize(12);
                pdf.text(`Pieces: ${sheet.pieces.length} | Utilization: ${this.calculateSheetUtilization(sheet).toFixed(1)}%`, 20, 45);
                
                // Create SVG for this sheet
                console.log(`Creating SVG for sheet ${sheetIndex + 1}...`);
                const svgData = this.createSVGElementForPDF(sheet, sheetIndex);
                console.log('SVG element created:', svgData);
                
                if (svgData && svgData.svgElement) {
                    try {
                        // Calculate dimensions to fit PDF page (A4 landscape: 297x210mm)
                        const maxWidth = 250; // Leave margins
                        const maxHeight = 140;
                        
                        const svgAspectRatio = svgData.width / svgData.height;
                        let finalWidth = maxWidth;
                        let finalHeight = maxWidth / svgAspectRatio;
                        
                        if (finalHeight > maxHeight) {
                            finalHeight = maxHeight;
                            finalWidth = maxHeight * svgAspectRatio;
                        }
                        
                        // Use svg2pdf to add SVG directly to PDF (new API)
                        await pdf.svg(svgData.svgElement, {
                            x: 20,
                            y: 55, 
                            width: finalWidth,
                            height: finalHeight
                        });
                        
                        // Clean up - remove SVG from DOM
                        svgData.svgElement.remove();
                        
                        console.log(`SVG rendered successfully for sheet ${sheetIndex + 1}`);
                            
                    } catch (svgError) {
                        console.error('SVG rendering error:', svgError);
                        
                        // Clean up on error
                        if (svgData.svgElement && svgData.svgElement.parentNode) {
                            svgData.svgElement.remove();
                        }
                        
                        // Fallback: add text description with better formatting
                        pdf.setFontSize(14);
                        pdf.text(`Sheet ${sheetIndex + 1} Layout`, 20, 60);
                        pdf.setFontSize(10);
                        pdf.text('SVG rendering failed. Piece list:', 20, 75);
                        
                        let fallbackY = 90;
                        sheet.pieces.forEach((piece, pieceIndex) => {
                            const text = `${pieceIndex + 1}. ${piece.name || 'Piece'} - ${piece.width}×${piece.height}mm at position (${piece.x}, ${piece.y})`;
                            
                            // Handle page breaks
                            if (fallbackY > 190) {
                                pdf.addPage('l');
                                fallbackY = 30;
                                pdf.setFontSize(12);
                                pdf.text(`Sheet ${sheetIndex + 1} - Continued`, 20, fallbackY);
                                fallbackY += 15;
                                pdf.setFontSize(10);
                            }
                            
                            pdf.text(text, 25, fallbackY);
                            fallbackY += 8;
                        });
                    }
                } else {
                    // Fallback if no SVG could be created
                    pdf.text('Unable to render sheet visualization', 20, 60);
                    let fallbackY = 75;
                    sheet.pieces.forEach((piece, pieceIndex) => {
                        const text = `${pieceIndex + 1}. ${piece.name || 'Piece'} - ${piece.width}×${piece.height}mm`;
                        pdf.text(text, 25, fallbackY);
                        fallbackY += 8;
                    });
                }
            }
            
            // Save the PDF
            const filename = `cutting-layout-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(filename);
            
            // Show success message
            console.log('PDF export completed successfully');
            this.showSuccess(`✅ PDF exported successfully! File saved as: ${filename}\n📊 Contains ${this.currentLayout.sheets.length} sheet diagrams with SVG layouts`);
            
        } catch (error) {
            console.error('PDF export error:', error);
            this.showError('❌ Failed to export PDF: ' + error.message + '\n\nPlease try again or check browser console for details.');
        }
    }
    
    showError(message) {
        console.error('Error:', message);
        
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.classList.add('show');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
                errorElement.classList.remove('show');
            }, 5000);
        } else {
            // Fallback to alert if error element not found
            alert(message);
        }
        
        // Also show in console for debugging
        console.warn('User error message:', message);
    }
    
    showSuccess(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.style.backgroundColor = '#10b981';
            errorElement.classList.add('show');
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
                errorElement.style.backgroundColor = ''; // Reset to default
                errorElement.classList.remove('show');
            }, 3000);
        }
    }
    
    saveSettings() {
        const settings = {
            language: this.currentLanguage,
            sheetWidth: document.getElementById('sheet-width').value,
            sheetHeight: document.getElementById('sheet-height').value,
            kerfWidth: document.getElementById('kerf-width').value,
            algorithm: document.getElementById('algorithm').value
        };
        
        localStorage.setItem('cuttingOptimizerSettings', JSON.stringify(settings));
    }
    
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('cuttingOptimizerSettings') || '{}');
            
            if (settings.language) {
                this.currentLanguage = settings.language;
            }
            
            if (settings.sheetWidth) {
                document.getElementById('sheet-width').value = settings.sheetWidth;
            }
            
            if (settings.sheetHeight) {
                document.getElementById('sheet-height').value = settings.sheetHeight;
            }
            
            if (settings.kerfWidth) {
                document.getElementById('kerf-width').value = settings.kerfWidth;
            }
            
            if (settings.algorithm) {
                document.getElementById('algorithm').value = settings.algorithm;
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }
    
    updateUI() {
        this.updatePiecePreview();
        this.updatePiecesList();
        this.updateSummary();
        this.updateCalculateButton();
    }
}

function addPieceSimple(width, height, name) {
    if (window.cuttingApp) {
        const nameInput = document.getElementById('piece-name');
        const widthInput = document.getElementById('piece-width');
        const heightInput = document.getElementById('piece-height');
        const quantityInput = document.getElementById('piece-quantity');
        
        nameInput.value = name || '';
        widthInput.value = width;
        heightInput.value = height;
        quantityInput.value = '1';
        
        window.cuttingApp.addPiece();
    }
}

function subtractPieceSimple(pieceIndex) {
    if (window.cuttingApp) {
        const piece = window.cuttingApp.pieceList[pieceIndex];
        if (piece && piece.quantity > 1) {
            piece.quantity -= 1;
        } else if (piece && piece.quantity === 1) {
            window.cuttingApp.pieceList.splice(pieceIndex, 1);
        }
        
        window.cuttingApp.updatePiecesList();
        window.cuttingApp.updateSummary();
        window.cuttingApp.updateCalculateButton();
    }
}

function removeAllPiecesSimple(pieceIndex) {
    if (window.cuttingApp) {
        window.cuttingApp.pieceList.splice(pieceIndex, 1);
        
        window.cuttingApp.updatePiecesList();
        window.cuttingApp.updateSummary();
        window.cuttingApp.updateCalculateButton();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cuttingApp = new CuttingOptimizerApp();
});
