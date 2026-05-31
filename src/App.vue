<template>
  <div id="app">
    <div class="toolbar">
      <div class="toolbar-group">
        <button @click="exportAs('png')" class="btn btn-gradient-png">
          <span class="btn-icon">📸</span> PNG
        </button>
        <button @click="exportAs('jpeg')" class="btn btn-gradient-jpeg">
          <span class="btn-icon">🖼️</span> JPEG
        </button>
        <button @click="exportAs('pdf')" class="btn btn-gradient-pdf">
          <span class="btn-icon">📄</span> PDF
        </button>
        <button @click="exportAs('svg')" class="btn btn-gradient-svg">
          <span class="btn-icon">🎨</span> SVG
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <select v-model="selectedStandardSize" @change="applyStandardSize" class="select-modern">
          <option value="A4 Portrait">📐 A4 Portrait</option>
          <option value="A4 Landscape">📐 A4 Landscape</option>
          <option value="A5 Portrait">📐 A5 Portrait</option>
          <option value="A5 Landscape">📐 A5 Landscape</option>
          <option value="Letter Portrait">📄 Letter Portrait</option>
          <option value="Letter Landscape">📄 Letter Landscape</option>
          <option value="Custom">⚙️ Custom</option>
        </select>
        
        <div class="size-input-group">
          <input type="number" v-model.number="customWidth" @input="updateCustomSize" placeholder="Ширина" class="size-input-modern" />
          <span class="size-separator">×</span>
          <input type="number" v-model.number="customHeight" @input="updateCustomSize" placeholder="Высота" class="size-input-modern" />
        </div>
        
        <div class="control-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="showGrid" />
            <span>📏 Сетка</span>
          </label>
          
          <label class="checkbox-label">
            <input type="checkbox" v-model="snapToGrid" />
            <span>🎯 Привязка</span>
          </label>
        </div>
        
        <select v-model="zoom" class="select-modern">
          <option :value="0.5">🔍 50%</option>
          <option :value="0.6">🔍 60%</option>
          <option :value="0.7">🔍 70%</option>
          <option :value="0.8">🔍 80%</option>
          <option :value="0.9">🔍 90%</option>
          <option :value="1">🔍 100%</option>
          <option :value="1.25">🔍 125%</option>
          <option :value="1.5">🔍 150%</option>
          <option :value="2">🔍 200%</option>
        </select>
      </div>
    </div>

    <div class="main-editor">
      <div class="layers-panel">
        <div class="panel-header">
          <h3><span>📑</span> <span>Слои</span></h3>
          <span class="layer-count">{{ elements.length }}</span>
        </div>
        
        <div class="add-element-section">
          <button @click="addTextBlock" class="btn-gradient-text btn-block">
            ✏️ Добавить текст
          </button>
          <button @click="triggerImageUpload" class="btn-gradient-image btn-block">
            🖼️ Загрузить изображение
          </button>
          <button @click="addBackgroundImage" class="btn-gradient-bg btn-block">
            🎨 Фоновое изображение
          </button>
          <input type="file" ref="imageInput" @change="uploadImage" accept="image/*" style="display: none" />
          <input type="file" ref="bgImageInput" @change="uploadBackgroundImage" accept="image/*" style="display: none" />
          
          <div class="url-input-group">
            <input type="text" v-model="imageUrl" placeholder="🔗 URL изображения" class="input-modern" />
            <button @click="addImageFromUrl" class="btn-small btn-gradient-url">Загрузить</button>
          </div>
        </div>
        
        <div class="layers-header">
          <span>📋 Список элементов</span>
          <div class="layer-controls-hint">
            <span class="hint-icon">⬆️</span>
            <span class="hint-icon">⬇️</span>
          </div>
        </div>
        
        <div class="layers-list">
          <div v-for="(element, index) in sortedElements" :key="element.id" 
               :class="['layer-item', { selected: selectedElementId === element.id }]"
               @click="selectedElementId = element.id">
            <div class="layer-drag-handle" @mousedown.stop="startDragLayer($event, index)">
              <span class="drag-icon">⋮⋮</span>
            </div>
            <div class="layer-icon">{{ element.type === 'text' ? '📝' : '🖼️' }}</div>
            <div class="layer-info">
              <div class="layer-name">{{ element.type === 'text' ? element.content.substring(0, 20) : 'Изображение' }}</div>
              <div class="layer-type">{{ element.type === 'text' ? 'Текст' : 'Графика' }}</div>
            </div>
            <div class="layer-order-controls">
              <button v-if="index > 0" @click.stop="moveLayerUp(index)" class="layer-order-btn" title="Вверх">⬆️</button>
              <button v-if="index < sortedElements.length - 1" @click.stop="moveLayerDown(index)" class="layer-order-btn" title="Вниз">⬇️</button>
            </div>
            <button @click.stop="deleteElement(element.id)" class="delete-layer-btn">✕</button>
          </div>
          <div v-if="elements.length === 0" class="empty-layers">
            <span>✨ Нет элементов</span>
            <small>Добавьте текст или изображение</small>
          </div>
        </div>
        
        <!-- Настройки фона -->
        <div class="properties-section">
          <div class="section-header">
            <h4>🎨 Фон</h4>
          </div>
          <div class="property-group">
            <label class="property-label">Цвет фона</label>
            <input type="color" v-model="backgroundColor" class="color-input" />
          </div>
          <div v-if="backgroundImage" class="property-group">
            <label class="property-label">Прозрачность: {{ bgOpacity }}%</label>
            <input type="range" v-model="bgOpacity" min="0" max="100" @input="drawCanvas" class="slider" />
            <button @click="removeBackgroundImage" class="btn-danger btn-small btn-block">🗑️ Удалить фон</button>
          </div>
        </div>
        
        <div v-if="selectedTextElement" class="properties-section">
          <div class="section-header">
            <h4>✏️ Свойства текста</h4>
          </div>
          <textarea v-model="selectedTextElement.content" @input="updateElement" rows="3" class="textarea-modern" placeholder="Текст..."></textarea>
          
          <select v-model="selectedTextElement.fontFamily" @change="updateElement" class="select-modern">
            <option v-for="font in popularFonts" :key="font.value" :value="font.value">
              🔤 {{ font.name }}
            </option>
          </select>
          
          <select v-model="selectedTextElement.fontSize" @change="updateElement" class="select-modern">
            <option v-for="size in fontSizes" :key="size" :value="size">📏 {{ size }}px</option>
          </select>
          
          <div class="style-buttons">
            <button @click="toggleBold" :class="{ active: selectedTextElement.fontWeight === 'bold' }" class="style-btn">
              <strong>B</strong>
            </button>
            <button @click="toggleItalic" :class="{ active: selectedTextElement.fontStyle === 'italic' }" class="style-btn">
              <em>I</em>
            </button>
          </div>
          
          <input type="color" v-model="selectedTextElement.color" @change="updateElement" class="color-input" />
          
          <select v-model="selectedTextElement.align" @change="updateElement" class="select-modern">
            <option value="left">⬅️ По левому краю</option>
            <option value="center">⬌ По центру</option>
            <option value="right">➡️ По правому краю</option>
          </select>
        </div>
        
        <div v-if="selectedImageElement && selectedImageElement.type !== 'background'" class="properties-section">
          <div class="section-header">
            <h4>🖼️ Свойства изображения</h4>
          </div>
          <div class="property-group">
            <label class="property-label">Ширина</label>
            <input type="number" v-model="selectedImageElement.width" @change="updateElement" class="input-modern" />
          </div>
          <div class="property-group">
            <label class="property-label">Высота</label>
            <input type="number" v-model="selectedImageElement.height" @change="updateElement" class="input-modern" />
          </div>
          <button @click="resetImageSize" class="btn-gradient-reset btn-small btn-block">🔄 Сбросить пропорции</button>
        </div>
      </div>

      <div class="canvas-area">
        <div class="canvas-wrapper" :style="{ transform: `scale(${zoom})`, transformOrigin: 'center center' }">
          <canvas ref="canvasRef" 
                  @mousedown="handleMouseDown"
                  @mousemove="handleMouseMove"
                  @mouseup="handleMouseUp"
                  @mouseleave="handleMouseUp"
                  :width="canvasSize.width"
                  :height="canvasSize.height">
          </canvas>
        </div>
      </div>

      <div class="templates-panel">
        <div class="panel-header">
          <h3><span>📚</span> <span>Шаблоны</span></h3>
        </div>
        
        <div class="save-template-section">
          <input type="text" v-model="templateName" placeholder="📝 Название шаблона" class="input-modern" />
          <button @click="saveTemplate" class="btn-gradient-save btn-block">
            💾 Сохранить как шаблон
          </button>
        </div>
        
        <div class="templates-list">
          <div v-for="template in templates" :key="template.id" class="template-card">
            <div class="template-info">
              <div class="template-name">
                <span class="template-icon">📄</span>
                {{ template.name }}
              </div>
              <div class="template-actions">
                <button @click="loadTemplate(template.xml)" class="btn-small btn-gradient-load">Загрузить</button>
                <button v-if="!template.isPreset" @click="deleteTemplate(template.id)" class="btn-small btn-gradient-delete">Удалить</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="import-section">
          <div class="section-header">
            <h4>📤 Импорт XML</h4>
          </div>
          <textarea v-model="importXml" placeholder="📋 Вставьте XML шаблона здесь..." rows="4" class="textarea-modern"></textarea>
          <button @click="importFromXml" class="btn-gradient-import btn-block">📥 Импортировать</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import jsPDF from 'jspdf'

export default {
  name: 'App',
  setup() {
    const canvasRef = ref(null)
    const imageInput = ref(null)
    const bgImageInput = ref(null)
    
    // Состояние редактора
    const canvasSize = ref({ width: 600, height: 850 })
    const backgroundColor = ref('#ffffff')
    const backgroundImage = ref(null)
    const bgOpacity = ref(100)
    const elements = ref([])
    const selectedElementId = ref(null)
    const showGrid = ref(false)
    const snapToGrid = ref(true)
    const zoom = ref(1.25) // Изменено с 0.8 на 1.25 (125%)
    const templates = ref([])
    const templateName = ref('')
    const importXml = ref('')
    const imageUrl = ref('')
    const customWidth = ref(600)
    const customHeight = ref(850)
    const selectedStandardSize = ref('A4 Portrait')
    const dragLayerIndex = ref(null)
    
    // Сохраняем пользовательский размер
    const customSize = ref({ width: 600, height: 850 })
    
    // Drag and resize state
    const dragging = ref(null)
    const resizing = ref(null)
    const resizeHandle = ref(null)
    const dragStart = ref({ x: 0, y: 0 })
    const originalElement = ref(null)
    
    // Размер сетки
    const gridSize = 20
    
    // Сортированные элементы (верхние элементы рисуются последними)
    const sortedElements = computed(() => {
      return [...elements.value].reverse()
    })
    
    // Популярные шрифты
    const popularFonts = [
      { name: 'Arial', value: 'Arial, sans-serif' },
      { name: 'Helvetica', value: 'Helvetica, sans-serif' },
      { name: 'Times New Roman', value: 'Times New Roman, serif' },
      { name: 'Georgia', value: 'Georgia, serif' },
      { name: 'Verdana', value: 'Verdana, sans-serif' },
      { name: 'Courier New', value: 'Courier New, monospace' },
      { name: 'Impact', value: 'Impact, sans-serif' },
      { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
      { name: 'Roboto', value: 'Roboto, sans-serif' },
      { name: 'Open Sans', value: 'Open Sans, sans-serif' }
    ]
    
    const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 54, 60, 72]
    
    // Стандартные размеры
    const standardSizes = {
      'A4 Portrait': { width: 600, height: 850 },
      'A4 Landscape': { width: 850, height: 600 },
      'A5 Portrait': { width: 420, height: 600 },
      'A5 Landscape': { width: 600, height: 420 },
      'Letter Portrait': { width: 620, height: 800 },
      'Letter Landscape': { width: 800, height: 620 },
      'Custom': { width: customSize.value.width, height: customSize.value.height }
    }
    
    // Привязка к сетке
    const snapToGridValue = (value) => {
      if (snapToGrid.value && showGrid.value) {
        return Math.round(value / gridSize) * gridSize
      }
      return value
    }
    
    // Вычисляемые свойства
    const selectedTextElement = computed(() => {
      const el = elements.value.find(e => e.id === selectedElementId.value)
      return el && el.type === 'text' ? el : null
    })
    
    const selectedImageElement = computed(() => {
      const el = elements.value.find(e => e.id === selectedElementId.value)
      return el && (el.type === 'image' || el.type === 'background') ? el : null
    })
    
    // Генерация уникального ID
    const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Управление слоями
    const startDragLayer = (event, index) => {
      dragLayerIndex.value = index
      event.preventDefault()
      
      const onMouseMove = (moveEvent) => {
        const target = moveEvent.target.closest('.layer-item')
        if (!target) return
        
        const rect = target.getBoundingClientRect()
        const mouseY = moveEvent.clientY
        const targetIndex = Array.from(target.parentNode.children).indexOf(target)
        
        if (targetIndex !== dragLayerIndex.value && targetIndex >= 0 && targetIndex < elements.value.length) {
          const newElements = [...elements.value]
          const [movedItem] = newElements.splice(elements.value.length - 1 - dragLayerIndex.value, 1)
          newElements.splice(elements.value.length - 1 - targetIndex, 0, movedItem)
          elements.value = newElements
          dragLayerIndex.value = targetIndex
        }
      }
      
      const onMouseUp = () => {
        dragLayerIndex.value = null
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        drawCanvas()
      }
      
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }
    
    const moveLayerUp = (index) => {
      if (index > 0) {
        const actualIndex = elements.value.length - 1 - index
        const newElements = [...elements.value]
        const temp = newElements[actualIndex]
        newElements[actualIndex] = newElements[actualIndex + 1]
        newElements[actualIndex + 1] = temp
        elements.value = newElements
        drawCanvas()
      }
    }
    
    const moveLayerDown = (index) => {
      if (index < elements.value.length - 1) {
        const actualIndex = elements.value.length - 1 - index
        const newElements = [...elements.value]
        const temp = newElements[actualIndex]
        newElements[actualIndex] = newElements[actualIndex - 1]
        newElements[actualIndex - 1] = temp
        elements.value = newElements
        drawCanvas()
      }
    }
    
    // Обновление пользовательского размера
    const updateCustomSize = () => {
      if (customWidth.value > 0 && customHeight.value > 0) {
        customSize.value = { width: customWidth.value, height: customHeight.value }
        if (selectedStandardSize.value === 'Custom') {
          canvasSize.value = { width: customWidth.value, height: customHeight.value }
          drawCanvas()
        }
      }
    }
    
    // Переключение жирности
    const toggleBold = () => {
      if (selectedTextElement.value) {
        selectedTextElement.value.fontWeight = 
          selectedTextElement.value.fontWeight === 'bold' ? 'normal' : 'bold'
        updateElement()
      }
    }
    
    // Переключение курсива
    const toggleItalic = () => {
      if (selectedTextElement.value) {
        selectedTextElement.value.fontStyle = 
          selectedTextElement.value.fontStyle === 'italic' ? 'normal' : 'italic'
        updateElement()
      }
    }
    
    // Добавление текстового блока
    const addTextBlock = () => {
      const newText = {
        id: generateId(),
        type: 'text',
        x: snapToGridValue(100),
        y: snapToGridValue(100),
        width: 200,
        height: 80,
        content: 'Новый текст',
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000',
        align: 'left'
      }
      elements.value.unshift(newText)
      selectedElementId.value = newText.id
      drawCanvas()
    }
    
    // Добавление фонового изображения
    const addBackgroundImage = () => {
      bgImageInput.value.click()
    }
    
    const uploadBackgroundImage = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            backgroundImage.value = {
              src: e.target.result,
              imgElement: img,
              width: img.width,
              height: img.height
            }
            drawCanvas()
          }
          img.src = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    const removeBackgroundImage = () => {
      backgroundImage.value = null
      bgOpacity.value = 100
      drawCanvas()
    }
    
    // Загрузка изображения с компьютера
    const triggerImageUpload = () => {
      imageInput.value.click()
    }
    
    const uploadImage = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          addImageToCanvas(e.target.result)
        }
        reader.readAsDataURL(file)
      }
    }
    
    // Добавление изображения из URL
    const addImageFromUrl = async () => {
      if (imageUrl.value) {
        await addImageToCanvas(imageUrl.value)
        imageUrl.value = ''
      }
    }
    
    const addImageToCanvas = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "Anonymous"
        img.onload = () => {
          const aspectRatio = img.width / img.height
          const width = 200
          const height = width / aspectRatio
          
          elements.value.unshift({
            id: generateId(),
            type: 'image',
            x: snapToGridValue(100),
            y: snapToGridValue(100),
            width: width,
            height: height,
            src: src,
            originalWidth: img.width,
            originalHeight: img.height,
            imgElement: img
          })
          drawCanvas()
          resolve()
        }
        img.onerror = () => {
          console.error('Failed to load image:', src)
          alert('Не удалось загрузить изображение по указанному URL. Проверьте ссылку и убедитесь, что изображение доступно.')
          reject()
        }
        img.src = src
      })
    }
    
    // Сброс размеров изображения до оригинальных пропорций
    const resetImageSize = () => {
      if (selectedImageElement.value && selectedImageElement.value.originalWidth) {
        const aspectRatio = selectedImageElement.value.originalWidth / selectedImageElement.value.originalHeight
        selectedImageElement.value.width = 200
        selectedImageElement.value.height = 200 / aspectRatio
        updateElement()
      }
    }
    
    // Удаление элемента
    const deleteElement = (id) => {
      elements.value = elements.value.filter(el => el.id !== id)
      if (selectedElementId.value === id) {
        selectedElementId.value = null
      }
      drawCanvas()
    }
    
    // Обновление элемента
    const updateElement = () => {
      drawCanvas()
    }
    
    // Применение стандартного размера
    const applyStandardSize = () => {
      if (selectedStandardSize.value === 'Custom') {
        canvasSize.value = { width: customSize.value.width, height: customSize.value.height }
        customWidth.value = customSize.value.width
        customHeight.value = customSize.value.height
      } else if (standardSizes[selectedStandardSize.value]) {
        const size = standardSizes[selectedStandardSize.value]
        canvasSize.value = { width: size.width, height: size.height }
        customWidth.value = size.width
        customHeight.value = size.height
      }
      drawCanvas()
    }
    
    // Поиск хендла для ресайза
    const getResizeHandle = (element, mouseX, mouseY) => {
      const handleSize = 8
      const handles = [
        { name: 'nw', x: element.x, y: element.y, cursor: 'nw-resize' },
        { name: 'n', x: element.x + element.width / 2, y: element.y, cursor: 'n-resize' },
        { name: 'ne', x: element.x + element.width, y: element.y, cursor: 'ne-resize' },
        { name: 'w', x: element.x, y: element.y + element.height / 2, cursor: 'w-resize' },
        { name: 'e', x: element.x + element.width, y: element.y + element.height / 2, cursor: 'e-resize' },
        { name: 'sw', x: element.x, y: element.y + element.height, cursor: 'sw-resize' },
        { name: 's', x: element.x + element.width / 2, y: element.y + element.height, cursor: 's-resize' },
        { name: 'se', x: element.x + element.width, y: element.y + element.height, cursor: 'se-resize' }
      ]
      
      for (const handle of handles) {
        if (Math.abs(mouseX - handle.x) <= handleSize && Math.abs(mouseY - handle.y) <= handleSize) {
          return handle
        }
      }
      return null
    }
    
    // Обработчики мыши для drag and drop и resize
    const handleMouseDown = (event) => {
      const rect = canvasRef.value.getBoundingClientRect()
      const scaleX = canvasRef.value.width / rect.width
      const scaleY = canvasRef.value.height / rect.height
      const mouseX = (event.clientX - rect.left) * scaleX
      const mouseY = (event.clientY - rect.top) * scaleY
      
      // Поиск элемента под курсором (в порядке от верхнего к нижнему)
      const clickedElement = [...elements.value].find(el => {
        return mouseX >= el.x && mouseX <= el.x + el.width &&
               mouseY >= el.y && mouseY <= el.y + el.height
      })
      
      if (clickedElement) {
        selectedElementId.value = clickedElement.id
        
        // Проверка на хендл ресайза
        const handle = getResizeHandle(clickedElement, mouseX, mouseY)
        if (handle) {
          resizing.value = clickedElement.id
          resizeHandle.value = handle
          dragStart.value = { x: mouseX, y: mouseY }
          originalElement.value = { ...clickedElement }
          event.preventDefault()
          return
        }
        
        // Иначе начинаем перетаскивание
        dragging.value = clickedElement.id
        dragStart.value = { x: mouseX - clickedElement.x, y: mouseY - clickedElement.y }
      } else {
        selectedElementId.value = null
      }
      
      drawCanvas()
    }
    
    const handleMouseMove = (event) => {
      if (!dragging.value && !resizing.value) return
      
      const rect = canvasRef.value.getBoundingClientRect()
      const scaleX = canvasRef.value.width / rect.width
      const scaleY = canvasRef.value.height / rect.height
      let mouseX = (event.clientX - rect.left) * scaleX
      let mouseY = (event.clientY - rect.top) * scaleY
      
      if (dragging.value) {
        // Перетаскивание элемента
        const element = elements.value.find(el => el.id === dragging.value)
        if (element) {
          let newX = mouseX - dragStart.value.x
          let newY = mouseY - dragStart.value.y
          
          // Привязка к сетке
          if (snapToGrid.value && showGrid.value) {
            newX = Math.round(newX / gridSize) * gridSize
            newY = Math.round(newY / gridSize) * gridSize
          }
          
          // Ограничение по границам
          newX = Math.max(0, Math.min(newX, canvasSize.value.width - element.width))
          newY = Math.max(0, Math.min(newY, canvasSize.value.height - element.height))
          
          element.x = newX
          element.y = newY
          drawCanvas()
        }
      } else if (resizing.value && resizeHandle.value) {
        // Изменение размера элемента
        const element = elements.value.find(el => el.id === resizing.value)
        if (element && originalElement.value) {
          const dx = mouseX - dragStart.value.x
          const dy = mouseY - dragStart.value.y
          
          let newWidth = originalElement.value.width
          let newHeight = originalElement.value.height
          let newX = originalElement.value.x
          let newY = originalElement.value.y
          
          switch (resizeHandle.value.name) {
            case 'nw':
              newWidth = originalElement.value.width - dx
              newHeight = originalElement.value.height - dy
              newX = originalElement.value.x + dx
              newY = originalElement.value.y + dy
              break
            case 'n':
              newHeight = originalElement.value.height - dy
              newY = originalElement.value.y + dy
              break
            case 'ne':
              newWidth = originalElement.value.width + dx
              newHeight = originalElement.value.height - dy
              newY = originalElement.value.y + dy
              break
            case 'w':
              newWidth = originalElement.value.width - dx
              newX = originalElement.value.x + dx
              break
            case 'e':
              newWidth = originalElement.value.width + dx
              break
            case 'sw':
              newWidth = originalElement.value.width - dx
              newHeight = originalElement.value.height + dy
              newX = originalElement.value.x + dx
              break
            case 's':
              newHeight = originalElement.value.height + dy
              break
            case 'se':
              newWidth = originalElement.value.width + dx
              newHeight = originalElement.value.height + dy
              break
          }
          
          // Привязка к сетке
          if (snapToGrid.value && showGrid.value) {
            newWidth = Math.round(newWidth / gridSize) * gridSize
            newHeight = Math.round(newHeight / gridSize) * gridSize
            newX = Math.round(newX / gridSize) * gridSize
            newY = Math.round(newY / gridSize) * gridSize
          }
          
          // Минимальные размеры
          const minWidth = element.type === 'text' ? 50 : 20
          const minHeight = element.type === 'text' ? 30 : 20
          
          if (newWidth >= minWidth && newX >= 0 && newX + newWidth <= canvasSize.value.width) {
            element.width = newWidth
            element.x = newX
          }
          
          if (newHeight >= minHeight && newY >= 0 && newY + newHeight <= canvasSize.value.height) {
            element.height = newHeight
            element.y = newY
          }
          
          drawCanvas()
        }
      }
    }
    
    const handleMouseUp = () => {
      dragging.value = null
      resizing.value = null
      resizeHandle.value = null
      originalElement.value = null
    }
    
    // Отрисовка холста
    const drawCanvas = () => {
      const canvas = canvasRef.value
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Рисуем цвет фона всегда
      ctx.fillStyle = backgroundColor.value
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Рисуем фоновое изображение поверх цвета с прозрачностью
      if (backgroundImage.value && backgroundImage.value.imgElement) {
        ctx.save()
        ctx.globalAlpha = bgOpacity.value / 100
        ctx.drawImage(backgroundImage.value.imgElement, 0, 0, canvas.width, canvas.height)
        ctx.restore()
      }
      
      // Сетка
      if (showGrid.value) {
        ctx.strokeStyle = '#e0e0e0'
        ctx.lineWidth = 0.5
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, canvas.height)
          ctx.stroke()
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(canvas.width, y)
          ctx.stroke()
        }
        
        // Рисуем более яркие линии для основных делений
        ctx.strokeStyle = '#b0b0b0'
        ctx.lineWidth = 1
        for (let x = 0; x < canvas.width; x += gridSize * 5) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, canvas.height)
          ctx.stroke()
        }
        for (let y = 0; y < canvas.height; y += gridSize * 5) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(canvas.width, y)
          ctx.stroke()
        }
      }
      
      // Рисуем элементы в правильном порядке (от нижнего к верхнему)
      elements.value.forEach(element => {
        if (element.type === 'text') {
          ctx.save()
          const fontString = `${element.fontStyle || 'normal'} ${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`
          ctx.font = fontString
          ctx.fillStyle = element.color
          ctx.textBaseline = 'top'
          
          // Настройка выравнивания
          let xOffset = element.x
          switch (element.align) {
            case 'center':
              ctx.textAlign = 'center'
              xOffset = element.x + element.width / 2
              break
            case 'right':
              ctx.textAlign = 'right'
              xOffset = element.x + element.width
              break
            default:
              ctx.textAlign = 'left'
              xOffset = element.x
          }
          
          // Рисование текста с переносом строк
          const lines = element.content.split('\n')
          let y = element.y
          lines.forEach(line => {
            ctx.fillText(line, xOffset, y)
            y += element.fontSize + 5
          })
          
          // Рамка выделения и хендлы для ресайза
          if (selectedElementId.value === element.id) {
            ctx.strokeStyle = '#6366f1'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.strokeRect(element.x, element.y, element.width, element.height)
            ctx.setLineDash([])
            
            // Рисуем хендлы для ресайза
            ctx.fillStyle = '#6366f1'
            const handleSize = 6
            const handles = [
              { x: element.x, y: element.y },
              { x: element.x + element.width / 2, y: element.y },
              { x: element.x + element.width, y: element.y },
              { x: element.x, y: element.y + element.height / 2 },
              { x: element.x + element.width, y: element.y + element.height / 2 },
              { x: element.x, y: element.y + element.height },
              { x: element.x + element.width / 2, y: element.y + element.height },
              { x: element.x + element.width, y: element.y + element.height }
            ]
            
            handles.forEach(handle => {
              ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize)
            })
          }
          ctx.restore()
        } else if (element.type === 'image' && element.imgElement) {
          ctx.drawImage(element.imgElement, element.x, element.y, element.width, element.height)
          
          if (selectedElementId.value === element.id) {
            ctx.strokeStyle = '#6366f1'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.strokeRect(element.x, element.y, element.width, element.height)
            ctx.setLineDash([])
            
            // Рисуем хендлы для ресайза
            ctx.fillStyle = '#6366f1'
            const handleSize = 6
            const handles = [
              { x: element.x, y: element.y },
              { x: element.x + element.width / 2, y: element.y },
              { x: element.x + element.width, y: element.y },
              { x: element.x, y: element.y + element.height / 2 },
              { x: element.x + element.width, y: element.y + element.height / 2 },
              { x: element.x, y: element.y + element.height },
              { x: element.x + element.width / 2, y: element.y + element.height },
              { x: element.x + element.width, y: element.y + element.height }
            ]
            
            handles.forEach(handle => {
              ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize)
            })
          }
        }
      })
    }
    
    // Экспорт в различные форматы
    const exportAs = async (format) => {
      const canvas = canvasRef.value
      if (!canvas) return
      
      if (format === 'png') {
        const link = document.createElement('a')
        link.download = 'flyer.png'
        link.href = canvas.toDataURL('image/png')
        link.click()
      } else if (format === 'jpeg') {
        const link = document.createElement('a')
        link.download = 'flyer.jpg'
        link.href = canvas.toDataURL('image/jpeg', 0.95)
        link.click()
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({
          orientation: canvasSize.value.width > canvasSize.value.height ? 'l' : 'p',
          unit: 'px',
          format: [canvas.width, canvas.height]
        })
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
        pdf.save('flyer.pdf')
      } else if (format === 'svg') {
        const svgData = generateSVG()
        const blob = new Blob([svgData], { type: 'image/svg+xml' })
        const link = document.createElement('a')
        link.download = 'flyer.svg'
        link.href = URL.createObjectURL(blob)
        link.click()
        URL.revokeObjectURL(link.href)
      }
    }
    
    // Генерация SVG
    const generateSVG = () => {
      const escapeSvgText = (text) => {
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;')
      }
      
      let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${canvasSize.value.width}" height="${canvasSize.value.height}" xmlns="http://www.w3.org/2000/svg">`
      
      // Цвет фона
      svgContent += `
  <rect width="100%" height="100%" fill="${backgroundColor.value}"/>`
      
      // Фоновое изображение с прозрачностью
      if (backgroundImage.value && backgroundImage.value.src) {
        const opacity = bgOpacity.value / 100
        if (opacity > 0) {
          svgContent += `
  <image width="100%" height="100%" href="${escapeSvgText(backgroundImage.value.src)}" opacity="${opacity}"/>`
        }
      }
      
      // Элементы в правильном порядке
      elements.value.forEach(el => {
        if (el.type === 'text') {
          const lines = el.content.split('\n')
          let yOffset = el.y
          
          lines.forEach((line, index) => {
            let textAnchor = 'start'
            let xOffset = el.x
            
            switch (el.align) {
              case 'center':
                textAnchor = 'middle'
                xOffset = el.x + el.width / 2
                break
              case 'right':
                textAnchor = 'end'
                xOffset = el.x + el.width
                break
            }
            
            svgContent += `
  <text x="${xOffset}" y="${yOffset + (index * (el.fontSize + 5)) + el.fontSize}" 
        font-family="${escapeSvgText(el.fontFamily)}" 
        font-size="${el.fontSize}" 
        font-weight="${el.fontWeight}"
        font-style="${el.fontStyle || 'normal'}"
        fill="${el.color}"
        text-anchor="${textAnchor}">
    ${escapeSvgText(line)}
  </text>`
          })
        } else if (el.type === 'image' && el.src) {
          svgContent += `
  <image x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" href="${escapeSvgText(el.src)}"/>`
        }
      })
      
      svgContent += `
</svg>`
      return svgContent
    }
    
    // Сохранение шаблона в XML
    const saveTemplate = () => {
      if (!templateName.value) {
        alert('Введите название шаблона')
        return
      }
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<flyer width="${canvasSize.value.width}" height="${canvasSize.value.height}" background="${backgroundColor.value}" bgImage="${backgroundImage.value ? escapeXml(backgroundImage.value.src) : ''}" bgOpacity="${bgOpacity.value}">`
      
      elements.value.forEach(el => {
        if (el.type === 'text') {
          xml += `
  <element type="text" id="${el.id}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" 
           content="${escapeXml(el.content)}" font-family="${el.fontFamily}" font-size="${el.fontSize}" 
           font-weight="${el.fontWeight}" font-style="${el.fontStyle || 'normal'}" color="${el.color}" align="${el.align}"/>`
        } else if (el.type === 'image') {
          xml += `
  <element type="image" id="${el.id}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" src="${escapeXml(el.src)}"/>`
        }
      })
      
      xml += `\n</flyer>`
      
      const newTemplate = {
        id: generateId(),
        name: templateName.value,
        xml: xml,
        isPreset: false
      }
      
      templates.value.push(newTemplate)
      localStorage.setItem('flyer_templates', JSON.stringify(templates.value.filter(t => !t.isPreset)))
      templateName.value = ''
      alert('Шаблон сохранен!')
    }
    
    // Загрузка шаблона из XML
    const loadTemplate = async (xmlString) => {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
      const flyer = xmlDoc.querySelector('flyer')
      
      if (flyer) {
        const width = parseInt(flyer.getAttribute('width'))
        const height = parseInt(flyer.getAttribute('height'))
        canvasSize.value = { width, height }
        backgroundColor.value = flyer.getAttribute('background') || '#ffffff'
        
        const bgImageSrc = flyer.getAttribute('bgImage')
        const bgImageOpacity = parseInt(flyer.getAttribute('bgOpacity')) || 100
        
        if (bgImageSrc && bgImageSrc !== '') {
          const img = new Image()
          img.crossOrigin = "Anonymous"
          img.onload = () => {
            backgroundImage.value = {
              src: bgImageSrc,
              imgElement: img,
              width: img.width,
              height: img.height
            }
            bgOpacity.value = bgImageOpacity
            drawCanvas()
          }
          img.src = bgImageSrc
        } else {
          backgroundImage.value = null
          bgOpacity.value = 100
        }
        
        const loadedElements = []
        const elementsList = xmlDoc.querySelectorAll('element')
        
        for (const el of elementsList) {
          const type = el.getAttribute('type')
          if (type === 'text') {
            loadedElements.push({
              id: el.getAttribute('id') || generateId(),
              type: 'text',
              x: parseInt(el.getAttribute('x')),
              y: parseInt(el.getAttribute('y')),
              width: parseInt(el.getAttribute('width')),
              height: parseInt(el.getAttribute('height')),
              content: el.getAttribute('content'),
              fontFamily: el.getAttribute('font-family') || 'Arial, sans-serif',
              fontSize: parseInt(el.getAttribute('font-size')) || 16,
              fontWeight: el.getAttribute('font-weight') || 'normal',
              fontStyle: el.getAttribute('font-style') || 'normal',
              color: el.getAttribute('color') || '#000000',
              align: el.getAttribute('align') || 'left'
            })
          } else if (type === 'image') {
            const src = el.getAttribute('src')
            await new Promise((resolve) => {
              const img = new Image()
              img.crossOrigin = "Anonymous"
              img.onload = () => {
                loadedElements.push({
                  id: el.getAttribute('id') || generateId(),
                  type: 'image',
                  x: parseInt(el.getAttribute('x')),
                  y: parseInt(el.getAttribute('y')),
                  width: parseInt(el.getAttribute('width')),
                  height: parseInt(el.getAttribute('height')),
                  src: src,
                  originalWidth: img.width,
                  originalHeight: img.height,
                  imgElement: img
                })
                resolve()
              }
              img.onerror = () => {
                console.error('Failed to load image from template:', src)
                resolve()
              }
              img.src = src
            })
          }
        }
        
        elements.value = loadedElements
        drawCanvas()
      }
    }
    
    // Импорт из XML строки
    const importFromXml = async () => {
      if (importXml.value) {
        await loadTemplate(importXml.value)
        importXml.value = ''
      }
    }
    
    // Удаление шаблона (только пользовательские)
    const deleteTemplate = (id) => {
      const template = templates.value.find(t => t.id === id)
      if (template && !template.isPreset) {
        templates.value = templates.value.filter(t => t.id !== id)
        localStorage.setItem('flyer_templates', JSON.stringify(templates.value.filter(t => !t.isPreset)))
      }
    }
    
    // Экранирование XML
    const escapeXml = (str) => {
      if (!str) return ''
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
    }
    
    // Загрузка сохраненных шаблонов
    onMounted(() => {
      const savedTemplates = localStorage.getItem('flyer_templates')
      const userTemplates = savedTemplates ? JSON.parse(savedTemplates) : []
      
      // Предустановленные шаблоны
      const presetTemplates = [
        {
          id: 'preset1',
          name: 'Рекламная листовка',
          isPreset: true,
          xml: `<?xml version="1.0" encoding="UTF-8"?>
<flyer width="600" height="850" background="#f8f9fa" bgImage="" bgOpacity="100">
  <element type="text" id="t1" x="100" y="100" width="400" height="80" 
           content="СУПЕР АКЦИЯ!" font-family="Arial, sans-serif" font-size="48" 
           font-weight="bold" font-style="normal" color="#dc3545" align="center"/>
  <element type="text" id="t2" x="100" y="200" width="400" height="60" 
           content="Скидки до 50%" font-family="Arial, sans-serif" font-size="32" 
           font-weight="normal" font-style="italic" color="#495057" align="center"/>
</flyer>`
        },
        {
          id: 'preset2',
          name: 'Приглашение',
          isPreset: true,
          xml: `<?xml version="1.0" encoding="UTF-8"?>
<flyer width="600" height="850" background="#fff5f0" bgImage="" bgOpacity="100">
  <element type="text" id="t1" x="100" y="80" width="400" height="60" 
           content="ВЫ ПРИГЛАШЕНЫ" font-family="Georgia, serif" font-size="36" 
           font-weight="bold" font-style="normal" color="#e67e22" align="center"/>
  <element type="text" id="t2" x="100" y="160" width="400" height="200" 
           content="На вечеринку по случаю Нового года\n22 декабря в 19:00" 
           font-family="Georgia, serif" font-size="24" font-weight="normal" 
           font-style="italic" color="#7f8c8d" align="center"/>
</flyer>`
        },
        {
          id: 'preset3',
          name: 'Объявление',
          isPreset: true,
          xml: `<?xml version="1.0" encoding="UTF-8"?>
<flyer width="600" height="850" background="#e8f4f8" bgImage="" bgOpacity="100">
  <element type="text" id="t1" x="50" y="50" width="500" height="50" 
           content="ОБЪЯВЛЕНИЕ" font-family="Arial, sans-serif" font-size="32" 
           font-weight="bold" font-style="normal" color="#2980b9" align="center"/>
  <element type="text" id="t2" x="50" y="120" width="500" height="400" 
           content="Пропала собака\nПорода: такса\nОкрас: рыжий\nКличка: Барон\n\nТел.: 8-999-123-45-67" 
           font-family="Arial, sans-serif" font-size="20" font-weight="normal" 
           font-style="normal" color="#2c3e50" align="left"/>
</flyer>`
        }
      ]
      
      templates.value = [...presetTemplates, ...userTemplates]
      drawCanvas()
    })
    
    watch([canvasSize, backgroundColor, backgroundImage, bgOpacity, elements, selectedElementId, showGrid], () => {
      nextTick(() => drawCanvas())
    }, { deep: true })
    
    return {
      canvasRef,
      imageInput,
      bgImageInput,
      canvasSize,
      backgroundColor,
      backgroundImage,
      bgOpacity,
      elements,
      sortedElements,
      selectedElementId,
      showGrid,
      snapToGrid,
      zoom,
      templates,
      templateName,
      importXml,
      imageUrl,
      customWidth,
      customHeight,
      selectedStandardSize,
      standardSizes,
      popularFonts,
      fontSizes,
      selectedTextElement,
      selectedImageElement,
      toggleBold,
      toggleItalic,
      addTextBlock,
      addBackgroundImage,
      uploadBackgroundImage,
      removeBackgroundImage,
      triggerImageUpload,
      uploadImage,
      addImageFromUrl,
      resetImageSize,
      deleteElement,
      updateElement,
      updateCustomSize,
      applyStandardSize,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      exportAs,
      saveTemplate,
      loadTemplate,
      importFromXml,
      deleteTemplate,
      moveLayerUp,
      moveLayerDown,
      startDragLayer
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

/* Toolbar */
.toolbar {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  padding: 12px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  flex-shrink: 0;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.toolbar-divider {
  width: 1px;
  height: 30px;
  background: linear-gradient(135deg, #ddd, #bbb);
}

.toolbar-group {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

/* Gradient Buttons */
.btn {
  padding: 8px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-icon {
  margin-right: 6px;
}

.btn-gradient-png {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.btn-gradient-png:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-gradient-jpeg {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(240, 147, 251, 0.3);
}

.btn-gradient-jpeg:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);
}

.btn-gradient-pdf {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);
}

.btn-gradient-pdf:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.btn-gradient-svg {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(67, 233, 123, 0.3);
}

.btn-gradient-svg:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(67, 233, 123, 0.4);
}

.btn-gradient-text {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #333;
  font-weight: 600;
}

.btn-gradient-image {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #333;
  font-weight: 600;
}

.btn-gradient-bg {
  background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
  color: #333;
  font-weight: 600;
}

.btn-gradient-url {
  background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%);
  color: white;
}

.btn-gradient-save {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
  font-weight: 600;
}

.btn-gradient-load {
  background: linear-gradient(135deg, #5ee7df 0%, #b490ca 100%);
  color: white;
}

.btn-gradient-delete {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: #c62828;
}

.btn-gradient-import {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  color: #333;
  font-weight: 600;
}

.btn-gradient-reset {
  background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%);
  color: #333;
}

.btn-block {
  width: 100%;
  margin-bottom: 8px;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
}

/* Form elements */
.select-modern {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.select-modern:hover {
  border-color: #aaa;
  transform: translateY(-1px);
}

.input-modern {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  transition: all 0.2s;
}

.input-modern:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.textarea-modern {
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
}

.textarea-modern:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.size-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f8f8;
  padding: 4px 8px;
  border-radius: 10px;
}

.size-input-modern {
  width: 70px;
  padding: 6px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
}

.size-input-modern:focus {
  outline: none;
  border-color: #667eea;
}

.size-separator {
  color: #999;
  font-weight: 600;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  padding: 6px 12px;
  background: #f8f8f8;
  border-radius: 8px;
  transition: all 0.2s;
}

.checkbox-label:hover {
  background: #f0f0f0;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* Color input */
.color-input {
  width: 100%;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  padding: 2px;
  transition: all 0.2s;
}

.color-input:hover {
  border-color: #667eea;
}

/* Slider */
.slider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #764ba2;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

/* Main layout */
.main-editor {
  display: flex;
  gap: 0;
  flex: 1;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);
}

/* Panels */
.layers-panel,
.templates-panel {
  width: 340px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  overflow-y: auto;
  flex-shrink: 0;
}

.layers-panel {
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.templates-panel {
  border-left: 1px solid rgba(0, 0, 0, 0.05);
}

.panel-header {
  padding: 20px 20px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Убираем градиент с эмодзи, оставляя его только для текста */
.panel-header h3 span:first-child {
  background: none;
  -webkit-text-fill-color: initial;
  color: #333; /* Цвет для эмодзи */
}

.panel-header h3 span:last-child {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.layer-count {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: white;
  font-weight: 600;
}

/* Layers header */
.layers-header {
  padding: 12px 20px;
  background: rgba(102, 126, 234, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.layer-controls-hint {
  display: flex;
  gap: 8px;
}

.hint-icon {
  font-size: 12px;
  opacity: 0.6;
}

/* Add element section */
.add-element-section {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.url-input-group {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.url-input-group .input-modern {
  flex: 1;
}

/* Layers list */
.layers-list {
  max-height: 280px;
  overflow-y: auto;
  margin: 0;
}

.layer-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
}

.layer-item:hover {
  background: rgba(102, 126, 234, 0.05);
}

.layer-item.selected {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1), transparent);
  border-left: 3px solid #667eea;
}

.layer-drag-handle {
  cursor: grab;
  padding: 4px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.layer-drag-handle:hover {
  opacity: 1;
}

.drag-icon {
  font-size: 16px;
  letter-spacing: -2px;
  color: #999;
}

.layer-icon {
  font-size: 22px;
}

.layer-info {
  flex: 1;
}

.layer-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.layer-type {
  font-size: 11px;
  color: #999;
}

.layer-order-controls {
  display: flex;
  gap: 4px;
}

.layer-order-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  transition: all 0.2s;
  color: #999;
  border-radius: 4px;
}

.layer-order-btn:hover {
  background: #f0f0f0;
  color: #667eea;
}

.delete-layer-btn {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  transition: all 0.2s;
  border-radius: 4px;
}

.delete-layer-btn:hover {
  color: #c62828;
  background: #fee;
  transform: scale(1.1);
}

.empty-layers {
  padding: 60px 20px;
  text-align: center;
  color: #bbb;
}

.empty-layers span {
  display: block;
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-layers small {
  font-size: 12px;
}

/* Properties sections */
.properties-section {
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 12px;
}

.section-header h4 {
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.property-group {
  margin-bottom: 12px;
}

.property-label {
  display: block;
  font-size: 12px;
  color: #888;
  margin-bottom: 6px;
  font-weight: 500;
}

.style-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.style-btn {
  width: 40px;
  padding: 8px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.style-btn:hover {
  background: #e8e8e8;
  transform: translateY(-2px);
}

.style-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-color: transparent;
}

/* Canvas area */
.canvas-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at center, #e0e0e0 0%, #b0b0b0 100%);
  padding: 24px;
  overflow: auto;
}

.canvas-wrapper {
  display: inline-block;
  background: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
  border-radius: 4px;
}

.canvas-wrapper:hover {
  box-shadow: 0 30px 50px rgba(0, 0, 0, 0.3);
  transform: translateY(-4px);
}

.canvas-wrapper canvas {
  display: block;
  border-radius: 4px;
}

/* Templates panel */
.save-template-section {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.save-template-section .input-modern {
  margin-bottom: 8px;
}

.templates-list {
  padding: 16px 20px;
  max-height: 320px;
  overflow-y: auto;
}

.template-card {
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.template-card:hover {
  background: white;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}

.template-icon {
  font-size: 16px;
}

.template-actions {
  display: flex;
  gap: 6px;
}

.import-section {
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.import-section .textarea-modern {
  margin-bottom: 8px;
}

/* Button styles */
.btn-danger {
  background: linear-gradient(135deg, #ff6b6b, #c92a2a);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(201, 42, 42, 0.3);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2, #667eea);
}

/* Responsive */
@media (max-width: 1200px) {
  .main-editor {
    flex-direction: column;
  }
  
  .layers-panel,
  .templates-panel {
    width: 100%;
    max-height: 350px;
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
}
</style>