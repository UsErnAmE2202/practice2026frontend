<template>
  <div id="app">
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="toolbar-group">
          <button @click="exportAs('png')" class="btn btn-png">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="2.5" />
              <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            PNG
          </button>
          <button @click="exportAs('jpeg')" class="btn btn-jpeg">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="2.5" />
              <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />
              <rect x="8" y="8" width="8" height="8" rx="1" />
            </svg>
            JPEG
          </button>
          <button @click="exportAs('pdf')" class="btn btn-pdf">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16v16H4V4z" />
              <path d="M8 8h8M8 12h6M8 16h4" />
              <path d="M16 20l2-2-2-2" />
            </svg>
            PDF
          </button>
          <button @click="exportAs('svg')" class="btn btn-svg">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-2zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            SVG
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <select v-model="selectedStandardSize" @change="applyStandardSize" class="select-modern">
            <option value="A4 Portrait">A4 Portrait</option>
            <option value="A4 Landscape">A4 Landscape</option>
            <option value="A5 Portrait">A5 Portrait</option>
            <option value="A5 Landscape">A5 Landscape</option>
            <option value="Letter Portrait">Letter Portrait</option>
            <option value="Letter Landscape">Letter Landscape</option>
            <option value="Custom">Custom</option>
          </select>
          
          <div class="size-input-group">
            <input type="number" v-model.number="customWidth" @input="updateCustomSize" placeholder="Ширина" class="size-input-modern" />
            <span class="size-separator">×</span>
            <input type="number" v-model.number="customHeight" @input="updateCustomSize" placeholder="Высота" class="size-input-modern" />
          </div>
          
          <div class="control-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="showGrid" />
              <svg class="checkbox-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
              </svg>
              <span>Сетка</span>
            </label>
            
            <label class="checkbox-label">
              <input type="checkbox" v-model="snapToGrid" />
              <svg class="checkbox-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>Привязка</span>
            </label>
          </div>
          
          <select v-model="zoom" class="select-modern">
            <option :value="0.5">50%</option>
            <option :value="0.6">60%</option>
            <option :value="0.7">70%</option>
            <option :value="0.8">80%</option>
            <option :value="0.9">90%</option>
            <option :value="1">100%</option>
            <option :value="1.25">125%</option>
            <option :value="1.5">150%</option>
            <option :value="2">200%</option>
          </select>
        </div>
      </div>

      <!-- Кнопки входа и регистрации в правом верхнем углу -->
      <div class="auth-buttons" v-if="!currentUser">
        <button @click="openLoginModal" class="btn-login">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
          </svg>
          Вход
        </button>
        <button @click="openRegisterModal" class="btn-register">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="17" y1="11" x2="23" y2="11"/>
          </svg>
          Регистрация
        </button>
      </div>
      <div class="user-info" v-else>
        <svg class="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span class="username">{{ currentUser.username }}</span>
        <button @click="logout" class="btn-logout">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Выйти
        </button>
      </div>
    </div>

    <!-- Модальное окно входа -->
    <div v-if="showLoginModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal">
        <div class="modal-header">
          <h3>Вход в аккаунт</h3>
          <button @click="closeModals" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label>Имя пользователя</label>
            <input type="text" v-model="loginForm.username" placeholder="Введите имя" class="input-modern" />
          </div>
          <div class="input-group">
            <label>Пароль</label>
            <input type="password" v-model="loginForm.password" placeholder="Введите пароль" class="input-modern" @keyup.enter="login" />
          </div>
          <div v-if="loginError" class="error-message">{{ loginError }}</div>
          <button @click="login" class="btn btn-primary btn-block">Войти</button>
        </div>
        <div class="modal-footer">
          <span>Нет аккаунта? <a href="#" @click.prevent="switchToRegister">Зарегистрироваться</a></span>
        </div>
      </div>
    </div>

    <!-- Модальное окно регистрации -->
    <div v-if="showRegisterModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal">
        <div class="modal-header">
          <h3>Регистрация</h3>
          <button @click="closeModals" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label>Имя пользователя</label>
            <input type="text" v-model="registerForm.username" placeholder="Придумайте имя" class="input-modern" />
          </div>
          <div class="input-group">
            <label>Пароль</label>
            <input type="password" v-model="registerForm.password" placeholder="Придумайте пароль" class="input-modern" />
          </div>
          <div class="input-group">
            <label>Подтверждение пароля</label>
            <input type="password" v-model="registerForm.confirmPassword" placeholder="Повторите пароль" class="input-modern" @keyup.enter="register" />
          </div>
          <div v-if="registerError" class="error-message">{{ registerError }}</div>
          <button @click="register" class="btn btn-primary btn-block">Зарегистрироваться</button>
        </div>
        <div class="modal-footer">
          <span>Уже есть аккаунт? <a href="#" @click.prevent="switchToLogin">Войти</a></span>
        </div>
      </div>
    </div>

    <div class="main-editor">
      <div class="layers-panel">
        <div class="panel-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16v16H4V4z"/>
              <path d="M8 8h8M8 12h6M8 16h4"/>
            </svg>
            <span>Слои</span>
          </h3>
          <span class="layer-count">{{ elements.length }}</span>
        </div>
        
        <div class="add-element-section">
          <button @click="addTextBlock" class="btn-text btn-block">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 7h16M12 7v14M8 21h8" />
            </svg>
            Добавить текст
          </button>
          <button @click="triggerImageUpload" class="btn-image btn-block">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="2.5" />
              <path d="M21 15l-5-4-3 3-5-5-5 6" />
            </svg>
            Загрузить изображение
          </button>
          <button @click="addBackgroundImage" class="btn-bg btn-block">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
            </svg>
            Фоновое изображение
          </button>
          <input type="file" ref="imageInput" @change="uploadImage" accept="image/*" style="display: none" />
          <input type="file" ref="bgImageInput" @change="uploadBackgroundImage" accept="image/*" style="display: none" />
          
          <div class="url-input-group">
            <input type="text" v-model="imageUrl" placeholder="URL изображения" class="input-modern" />
            <button @click="addImageFromUrl" class="btn-small btn-url">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Загрузить
            </button>
          </div>
        </div>
        
        <div class="layers-header">
          <span>Список элементов</span>
          <div class="layer-controls-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
              <path d="M5 12h14M12 19l-7-7 7-7"/>
            </svg>
          </div>
        </div>
        
        <div class="layers-list">
          <div v-for="(element, index) in sortedElements" :key="element.id" 
               :class="['layer-item', { selected: selectedElementId === element.id }]"
               @click="selectedElementId = element.id">
            <div class="layer-drag-handle" @mousedown.stop="startDragLayer($event, index)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                <circle cx="9" cy="12" r="1.5"/>
                <circle cx="15" cy="12" r="1.5"/>
                <circle cx="9" cy="5" r="1.5"/>
                <circle cx="15" cy="5" r="1.5"/>
                <circle cx="9" cy="19" r="1.5"/>
                <circle cx="15" cy="19" r="1.5"/>
              </svg>
            </div>
            <div class="layer-icon">
              <svg v-if="element.type === 'text'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.8">
                <path d="M4 7h16M12 7v14M8 21h8"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.8">
                <rect x="2" y="3" width="20" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="2.5"/>
              </svg>
            </div>
            <div class="layer-info">
              <div class="layer-name">{{ element.type === 'text' ? element.content.substring(0, 20) : 'Изображение' }}</div>
              <div class="layer-type">{{ element.type === 'text' ? 'Текст' : 'Графика' }}</div>
            </div>
            <div class="layer-order-controls">
              <button v-if="index > 0" @click.stop="moveLayerUp(index)" class="layer-order-btn" title="Вверх">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
              </button>
              <button v-if="index < sortedElements.length - 1" @click.stop="moveLayerDown(index)" class="layer-order-btn" title="Вниз">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </div>
            <button @click.stop="deleteElement(element.id)" class="delete-layer-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div v-if="elements.length === 0" class="empty-layers">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5">
              <path d="M4 4h16v16H4V4z"/>
              <path d="M8 8h8M8 12h6M8 16h4"/>
            </svg>
            <span>Нет элементов. Добавьте текст или изображение</span>
          </div>
        </div>
        
        <div class="properties-section">
          <div class="section-header">
            <h4>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              Фон
            </h4>
          </div>
          <div class="property-group">
            <label class="property-label">Цвет фона</label>
            <input type="color" v-model="backgroundColor" class="color-input" />
          </div>
          <div v-if="backgroundImage" class="property-group">
            <label class="property-label">Прозрачность: {{ bgOpacity }}%</label>
            <input type="range" v-model="bgOpacity" min="0" max="100" @input="drawCanvas" class="slider" />
            <button @click="removeBackgroundImage" class="btn-danger btn-small btn-block">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              Удалить фон
            </button>
          </div>
        </div>
        
        <div v-if="selectedTextElement" class="properties-section">
          <div class="section-header">
            <h4>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 7h16M12 7v14M8 21h8"/>
              </svg>
              Свойства текста
            </h4>
          </div>
          <textarea v-model="selectedTextElement.content" @input="updateElement" rows="3" class="textarea-modern" placeholder="Текст..."></textarea>
          
          <select v-model="selectedTextElement.fontFamily" @change="updateElement" class="select-modern">
            <option v-for="font in popularFonts" :key="font.value" :value="font.value">
              {{ font.name }}
            </option>
          </select>
          
          <select v-model="selectedTextElement.fontSize" @change="updateElement" class="select-modern">
            <option v-for="size in fontSizes" :key="size" :value="size">{{ size }}px</option>
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
            <option value="left">По левому краю</option>
            <option value="center">По центру</option>
            <option value="right">По правому краю</option>
          </select>
        </div>
        
        <div v-if="selectedImageElement && selectedImageElement.type !== 'background'" class="properties-section">
          <div class="section-header">
            <h4>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="2.5"/>
              </svg>
              Свойства изображения
            </h4>
          </div>
          <div class="property-group">
            <label class="property-label">Ширина</label>
            <input type="number" v-model="selectedImageElement.width" @change="updateElement" class="input-modern" />
          </div>
          <div class="property-group">
            <label class="property-label">Высота</label>
            <input type="number" v-model="selectedImageElement.height" @change="updateElement" class="input-modern" />
          </div>
          <button @click="resetImageSize" class="btn-reset btn-small btn-block">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Сбросить пропорции
          </button>
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
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16v16H4V4z"/>
              <path d="M8 8h8M8 12h6M8 16h4"/>
              <path d="M16 20l2-2-2-2"/>
            </svg>
            <span>Шаблоны</span>
          </h3>
        </div>
        
        <div class="save-template-section">
          <input type="text" v-model="templateName" placeholder="Название шаблона" class="input-modern" />
          <button @click="saveTemplate" class="btn-save btn-block">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            Сохранить как шаблон
          </button>
        </div>
        
        <div class="templates-list">
          <div v-for="template in templates" :key="template.id" class="template-card">
            <div class="template-info">
              <div class="template-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16v16H4V4z"/>
                  <path d="M8 8h8M8 12h6M8 16h4"/>
                </svg>
                {{ template.name }}
              </div>
              <div class="template-actions">
                <button @click="loadTemplate(template.xml)" class="btn-small btn-load">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Загрузить
                </button>
                <button v-if="!template.isPreset" @click="deleteTemplate(template.id)" class="btn-small btn-delete">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="import-section">
          <div class="section-header">
            <h4>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Импорт XML
            </h4>
          </div>
          <textarea v-model="importXml" placeholder="Вставьте XML шаблона здесь..." rows="4" class="textarea-modern"></textarea>
          <button @click="importFromXml" class="btn-import btn-block">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Импортировать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { projectsAPI, templatesAPI, authAPI } from './api/client'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import jsPDF from 'jspdf'

export default {
  name: 'App',
  setup() {
    const isLoading = ref(false)
    const serverTemplates = ref([])
    const canvasRef = ref(null)
    const imageInput = ref(null)
    const bgImageInput = ref(null)
    
    const canvasSize = ref({ width: 600, height: 850 })
    const backgroundColor = ref('#ffffff')
    const backgroundImage = ref(null)
    const bgOpacity = ref(100)
    const elements = ref([])
    const selectedElementId = ref(null)
    const showGrid = ref(false)
    const snapToGrid = ref(true)
    const zoom = ref(1.25)
    const templates = ref([])
    const templateName = ref('')
    const importXml = ref('')
    const imageUrl = ref('')
    const customWidth = ref(600)
    const customHeight = ref(850)
    const selectedStandardSize = ref('A4 Portrait')
    const dragLayerIndex = ref(null)
    
    const customSize = ref({ width: 600, height: 850 })
    
    const dragging = ref(null)
    const resizing = ref(null)
    const resizeHandle = ref(null)
    const dragStart = ref({ x: 0, y: 0 })
    const originalElement = ref(null)
    
    const gridSize = 20
    
    // Auth state
    const currentUser = ref(null)
    const showLoginModal = ref(false)
    const showRegisterModal = ref(false)
    const loginForm = ref({ username: '', password: '' })
    const registerForm = ref({ username: '', password: '', confirmPassword: '' })
    const loginError = ref('')
    const registerError = ref('')
    
    const sortedElements = computed(() => {
      return [...elements.value].reverse(),
      isLoading,
      loadTemplatesFromServer
    })
    
    const popularFonts = [
      { name: 'Arial', value: 'Arial, sans-serif' },
      { name: 'Helvetica', value: 'Helvetica, sans-serif' },
      { name: 'Times New Roman', value: 'Times New Roman, serif' },
      { name: 'Georgia', value: 'Georgia, serif' },
      { name: 'Verdana', value: 'Verdana, sans-serif' },
      { name: 'Courier New', value: 'Courier New, monospace' },
      { name: 'Impact', value: 'Impact, sans-serif' },
      { name: 'Roboto', value: 'Roboto, sans-serif' },
      { name: 'Open Sans', value: 'Open Sans, sans-serif' }
    ]
    
    const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 54, 60, 72]
    
    const standardSizes = {
      'A4 Portrait': { width: 600, height: 850 },
      'A4 Landscape': { width: 850, height: 600 },
      'A5 Portrait': { width: 420, height: 600 },
      'A5 Landscape': { width: 600, height: 420 },
      'Letter Portrait': { width: 620, height: 800 },
      'Letter Landscape': { width: 800, height: 620 },
      'Custom': { width: customSize.value.width, height: customSize.value.height }
    }
    
    const snapToGridValue = (value) => {
      if (snapToGrid.value && showGrid.value) {
        return Math.round(value / gridSize) * gridSize
      }
      return value
    }
    
    const selectedTextElement = computed(() => {
      const el = elements.value.find(e => e.id === selectedElementId.value)
      return el && el.type === 'text' ? el : null
    })
    
    const selectedImageElement = computed(() => {
      const el = elements.value.find(e => e.id === selectedElementId.value)
      return el && (el.type === 'image' || el.type === 'background') ? el : null
    })
    
    const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Auth methods
    const openLoginModal = () => {
      loginForm.value = { username: '', password: '' }
      loginError.value = ''
      showLoginModal.value = true
    }
    
    const openRegisterModal = () => {
      registerForm.value = { username: '', password: '', confirmPassword: '' }
      registerError.value = ''
      showRegisterModal.value = true
    }
    
    const closeModals = () => {
      showLoginModal.value = false
      showRegisterModal.value = false
      loginError.value = ''
      registerError.value = ''
    }
    
    const switchToRegister = () => {
      closeModals()
      openRegisterModal()
    }
    
    const switchToLogin = () => {
      closeModals()
      openLoginModal()
    }
    
const loadTemplatesFromServer = async () => {
  try {
    isLoading.value = true
    const response = await templatesAPI.getAll()
    // Бэкенд возвращает массив шаблонов
    const serverTemplates = response.data.items || response.data
    
    // Преобразуем в формат фронтенда
    const formattedTemplates = serverTemplates.map(t => ({
      id: t.id,
      name: t.name,
      xml: t.xml_content,
      isPreset: t.user_id === null || t.user_id === undefined,
    }))
    
    // Сохраняем предустановленные шаблоны (те, что были в localStorage)
    // и добавляем серверные
    templates.value = formattedTemplates
  } catch (error) {
    console.error('Failed to load templates:', error)
    // Если сервер недоступен, используем локальные пресеты
    const savedTemplates = localStorage.getItem('flyer_templates')
    const userTemplates = savedTemplates ? JSON.parse(savedTemplates) : []
    const presetTemplates = getPresetTemplates() // вынесите пресеты в отдельную функцию
    templates.value = [...presetTemplates, ...userTemplates]
  } finally {
    isLoading.value = false
  }
}

const saveProjectToServer = async () => {
  try {
    isLoading.value = true
    const xmlContent = generateCurrentXML()
    const response = await projectsAPI.create('Новый проект', xmlContent)
    alert(`Проект сохранён! ID: ${response.data.id}`)
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    alert('Ошибка сохранения проекта')
  } finally {
    isLoading.value = false
  }
}

    const login = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    loginError.value = 'Заполните все поля'
    return
  }
  
  try {
    isLoading.value = true
    const response = await authAPI.login(loginForm.value.username, loginForm.value.password)
    
    console.log('Login response:', response.data)
    
    if (response.data && response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token)
      currentUser.value = { username: loginForm.value.username }
      
      closeModals()
      loginError.value = ''
      
      // ВАЖНО: перезагружаем шаблоны с токеном
      await loadTemplatesFromServer()
    } else {
      loginError.value = 'Неверный ответ сервера'
    }
  } catch (error) {
    console.error('Login error:', error)
    loginError.value = 'Неверное имя пользователя или пароль'
  } finally {
    isLoading.value = false
  }
}
    
    const register = async () => {
  if (!registerForm.value.username || !registerForm.value.password) {
    registerError.value = 'Заполните все поля'
    return
  }
  
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerError.value = 'Пароли не совпадают'
    return
  }
  
  if (registerForm.value.password.length < 3) {
    registerError.value = 'Пароль должен быть не менее 3 символов'
    return
  }
  
  try {
    isLoading.value = true
    // Регистрируем пользователя
    await authAPI.register(registerForm.value.username, registerForm.value.password)
    
    // После успешной регистрации автоматически входим
    const loginResponse = await authAPI.login(registerForm.value.username, registerForm.value.password)
    localStorage.setItem('access_token', loginResponse.data.access_token)
    currentUser.value = { username: registerForm.value.username }
    
    closeModals()
    registerError.value = ''
    
    // После регистрации обновляем список шаблонов
    await loadTemplatesFromServer()
  } catch (error) {
    console.error('Registration error:', error)
    if (error.response && error.response.status === 400) {
      registerError.value = error.response.data.detail || 'Пользователь с таким именем уже существует'
    } else {
      registerError.value = 'Ошибка сервера. Попробуйте позже.'
    }
  } finally {
    isLoading.value = false
  }
}

    const logout = () => {
  currentUser.value = null
  localStorage.removeItem('access_token')
  // Не очищаем редактор, но обновляем шаблоны (показываем только пресеты)
  loadTemplatesFromServer()
}
    
    const startDragLayer = (event, index) => {
      dragLayerIndex.value = index
      event.preventDefault()
      
      const onMouseMove = (moveEvent) => {
        const target = moveEvent.target.closest('.layer-item')
        if (!target) return
        
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
    
    const updateCustomSize = () => {
      if (customWidth.value > 0 && customHeight.value > 0) {
        customSize.value = { width: customWidth.value, height: customHeight.value }
        if (selectedStandardSize.value === 'Custom') {
          canvasSize.value = { width: customWidth.value, height: customHeight.value }
          drawCanvas()
        }
      }
    }
    
    const toggleBold = () => {
      if (selectedTextElement.value) {
        selectedTextElement.value.fontWeight = 
          selectedTextElement.value.fontWeight === 'bold' ? 'normal' : 'bold'
        updateElement()
      }
    }
    
    const toggleItalic = () => {
      if (selectedTextElement.value) {
        selectedTextElement.value.fontStyle = 
          selectedTextElement.value.fontStyle === 'italic' ? 'normal' : 'italic'
        updateElement()
      }
    }
    
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
    
    const resetImageSize = () => {
      if (selectedImageElement.value && selectedImageElement.value.originalWidth) {
        const aspectRatio = selectedImageElement.value.originalWidth / selectedImageElement.value.originalHeight
        selectedImageElement.value.width = 200
        selectedImageElement.value.height = 200 / aspectRatio
        updateElement()
      }
    }
    
    const deleteElement = (id) => {
      elements.value = elements.value.filter(el => el.id !== id)
      if (selectedElementId.value === id) {
        selectedElementId.value = null
      }
      drawCanvas()
    }
    
    const updateElement = () => {
      drawCanvas()
    }
    
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
    
    const handleMouseDown = (event) => {
      const rect = canvasRef.value.getBoundingClientRect()
      const scaleX = canvasRef.value.width / rect.width
      const scaleY = canvasRef.value.height / rect.height
      const mouseX = (event.clientX - rect.left) * scaleX
      const mouseY = (event.clientY - rect.top) * scaleY
      
      const clickedElement = [...elements.value].find(el => {
        return mouseX >= el.x && mouseX <= el.x + el.width &&
               mouseY >= el.y && mouseY <= el.y + el.height
      })
      
      if (clickedElement) {
        selectedElementId.value = clickedElement.id
        
        const handle = getResizeHandle(clickedElement, mouseX, mouseY)
        if (handle) {
          resizing.value = clickedElement.id
          resizeHandle.value = handle
          dragStart.value = { x: mouseX, y: mouseY }
          originalElement.value = { ...clickedElement }
          event.preventDefault()
          return
        }
        
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
        const element = elements.value.find(el => el.id === dragging.value)
        if (element) {
          let newX = mouseX - dragStart.value.x
          let newY = mouseY - dragStart.value.y
          
          if (snapToGrid.value && showGrid.value) {
            newX = Math.round(newX / gridSize) * gridSize
            newY = Math.round(newY / gridSize) * gridSize
          }
          
          newX = Math.max(0, Math.min(newX, canvasSize.value.width - element.width))
          newY = Math.max(0, Math.min(newY, canvasSize.value.height - element.height))
          
          element.x = newX
          element.y = newY
          drawCanvas()
        }
      } else if (resizing.value && resizeHandle.value) {
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
          
          if (snapToGrid.value && showGrid.value) {
            newWidth = Math.round(newWidth / gridSize) * gridSize
            newHeight = Math.round(newHeight / gridSize) * gridSize
            newX = Math.round(newX / gridSize) * gridSize
            newY = Math.round(newY / gridSize) * gridSize
          }
          
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
    
    const drawCanvas = () => {
      const canvas = canvasRef.value
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = backgroundColor.value
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      if (backgroundImage.value && backgroundImage.value.imgElement) {
        ctx.save()
        ctx.globalAlpha = bgOpacity.value / 100
        ctx.drawImage(backgroundImage.value.imgElement, 0, 0, canvas.width, canvas.height)
        ctx.restore()
      }
      
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
      
      elements.value.forEach(element => {
        if (element.type === 'text') {
          ctx.save()
          const fontString = `${element.fontStyle || 'normal'} ${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`
          ctx.font = fontString
          ctx.fillStyle = element.color
          ctx.textBaseline = 'top'
          
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
          
          const lines = element.content.split('\n')
          let y = element.y
          lines.forEach(line => {
            ctx.fillText(line, xOffset, y)
            y += element.fontSize + 5
          })
          
          if (selectedElementId.value === element.id) {
            ctx.strokeStyle = '#3b82f6'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.strokeRect(element.x, element.y, element.width, element.height)
            ctx.setLineDash([])
            
            ctx.fillStyle = '#3b82f6'
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
            ctx.strokeStyle = '#3b82f6'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.strokeRect(element.x, element.y, element.width, element.height)
            ctx.setLineDash([])
            
            ctx.fillStyle = '#3b82f6'
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
      
      svgContent += `
  <rect width="100%" height="100%" fill="${backgroundColor.value}"/>`
      
      if (backgroundImage.value && backgroundImage.value.src) {
        const opacity = bgOpacity.value / 100
        if (opacity > 0) {
          svgContent += `
  <image width="100%" height="100%" href="${escapeSvgText(backgroundImage.value.src)}" opacity="${opacity}"/>`
        }
      }
      
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
    
const generateCurrentXML = () => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<flyer width="${canvasSize.value.width}" height="${canvasSize.value.height}" 
       background="${backgroundColor.value}" bgImage="${backgroundImage.value ? escapeXml(backgroundImage.value.src) : ''}" 
       bgOpacity="${bgOpacity.value}">`
  
  elements.value.forEach(el => {
    if (el.type === 'text') {
      xml += `
  <element type="text" id="${el.id}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" 
           content="${escapeXml(el.content)}" font-family="${el.fontFamily}" font-size="${el.fontSize}" 
           font-weight="${el.fontWeight}" font-style="${el.fontStyle || 'normal'}" color="${el.color}" align="${el.align}"/>`
    } else if (el.type === 'image') {
      xml += `
  <element type="image" id="${el.id}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" 
           src="${escapeXml(el.src)}"/>`
    }
  })
  
  xml += `\n</flyer>`
  return xml
}

    const saveTemplate = async () => {
  if (!templateName.value) {
    alert('Введите название шаблона')
    return
  }
  
  try {
    isLoading.value = true
    const xmlContent = generateCurrentXML()
    
    // Отправляем на сервер
    const response = await templatesAPI.create(templateName.value, xmlContent)
    console.log('Template saved to server:', response.data)
    
    // Обновляем список шаблонов с сервера
    await loadTemplatesFromServer()
    
    templateName.value = ''
    alert('Шаблон сохранён на сервере!')
  } catch (error) {
    console.error('Failed to save template:', error)
    if (error.response && error.response.status === 401) {
      alert('Необходимо авторизоваться для сохранения шаблона')
    } else {
      alert('Ошибка сохранения шаблона')
    }
  } finally {
    isLoading.value = false
  }
}
    
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
    
    const importFromXml = async () => {
      if (importXml.value) {
        await loadTemplate(importXml.value)
        importXml.value = ''
      }
    }
    
    const deleteTemplate = async (id) => {
  // Проверяем, что это не предустановленный шаблон
  const template = templates.value.find(t => t.id === id)
  if (!template || template.isPreset) {
    alert('Нельзя удалить предустановленный шаблон')
    return
  }
  
  if (!confirm('Удалить шаблон?')) return
  
  try {
    isLoading.value = true
    await templatesAPI.delete(id)
    console.log('Template deleted from server:', id)
    
    // Обновляем список шаблонов
    await loadTemplatesFromServer()
    alert('Шаблон удалён')
  } catch (error) {
    console.error('Failed to delete template:', error)
    if (error.response && error.response.status === 401) {
      alert('Необходимо авторизоваться для удаления шаблона')
    } else if (error.response && error.response.status === 403) {
      alert('Вы не можете удалить этот шаблон')
    } else {
      alert('Ошибка удаления шаблона')
    }
  } finally {
    isLoading.value = false
  }
}
    
    const escapeXml = (str) => {
      if (!str) return ''
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
    }
    
   onMounted(() => {
  // Загружаем шаблоны с сервера
  loadTemplatesFromServer()
  
  // Проверяем сохранённую сессию
  const token = localStorage.getItem('access_token')
  if (token) {
    const savedUser = localStorage.getItem('flyer_username')
    if (savedUser) {
      currentUser.value = { username: savedUser }
  }
  }
  
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
      startDragLayer,
      // Auth
      currentUser,
      showLoginModal,
      showRegisterModal,
      loginForm,
      registerForm,
      loginError,
      registerError,
      openLoginModal,
      openRegisterModal,
      closeModals,
      switchToRegister,
      switchToLogin,
      login,
      register,
      logout
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
  background: #f1f5f9;
  overflow: hidden;
}

.toolbar {
  background: white;
  padding: 12px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  flex-wrap: wrap;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
}

.toolbar-left {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.toolbar-divider {
  width: 1px;
  height: 30px;
  background: #e2e8f0;
}

.toolbar-group {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

/* Auth buttons */
.auth-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-login, .btn-register, .btn-logout {
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-login {
  background: #e2e8f0;
  color: #334155;
}
.btn-login:hover {
  background: #cbd5e1;
}

.btn-register {
  background: #3b82f6;
  color: white;
}
.btn-register:hover {
  background: #2563eb;
}

.btn-logout {
  background: #f1f5f9;
  color: #ef4444;
  border: 1px solid #fee2e2;
}
.btn-logout:hover {
  background: #fee2e2;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  padding: 4px 12px 4px 8px;
  border-radius: 30px;
  border: 1px solid #e2e8f0;
}

.user-icon {
  width: 28px;
  height: 28px;
  color: #3b82f6;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.3);
  animation: modalFadeIn 0.2s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  padding: 20px 24px 12px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #94a3b8;
  line-height: 1;
  padding: 0 4px;
}
.modal-close:hover {
  color: #475569;
}

.modal-body {
  padding: 20px 24px;
}

.modal-body .input-group {
  margin-bottom: 16px;
}

.modal-body .input-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 6px;
}

.modal-body .input-modern {
  width: 100%;
}

.modal-footer {
  padding: 12px 24px 20px;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  font-size: 13px;
  color: #64748b;
}

.modal-footer a {
  color: #3b82f6;
  text-decoration: none;
  cursor: pointer;
}
.modal-footer a:hover {
  text-decoration: underline;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  margin-bottom: 16px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #2563eb;
}

.btn-block {
  width: 100%;
  justify-content: center;
}

.btn {
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.btn-png { background: #3b82f6; color: white; }
.btn-png:hover { background: #2563eb; }
.btn-jpeg { background: #ec489a; color: white; }
.btn-jpeg:hover { background: #db2777; }
.btn-pdf { background: #06b6d4; color: white; }
.btn-pdf:hover { background: #0891b2; }
.btn-svg { background: #10b981; color: white; }
.btn-svg:hover { background: #059669; }

.btn-text, .btn-image, .btn-bg {
  font-weight: 500;
  width: 100%;
  margin-bottom: 8px;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  border: 1px solid;
}

.btn-text { background: #d1fae5; border-color: #a7f3d0; color: #065f46; }
.btn-text:hover { background: #a7f3d0; }
.btn-image { background: #fed7aa; border-color: #fdba74; color: #9a3412; }
.btn-image:hover { background: #fdba74; }
.btn-bg { background: #bfdbfe; border-color: #93c5fd; color: #1e3a8a; }
.btn-bg:hover { background: #93c5fd; }

.btn-url { background: #60a5fa; color: white; }
.btn-url:hover { background: #3b82f6; }
.btn-save { background: #f97316; color: white; }
.btn-save:hover { background: #ea580c; }
.btn-load { background: #14b8a6; color: white; }
.btn-load:hover { background: #0d9488; }
.btn-delete { background: #fecaca; color: #dc2626; border: 1px solid #fca5a5; }
.btn-delete:hover { background: #fca5a5; }
.btn-import { background: #8b5cf6; color: white; }
.btn-import:hover { background: #7c3aed; }
.btn-reset { background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; }
.btn-reset:hover { background: #c7d2fe; }
.btn-danger { background: #dc2626; color: white; }
.btn-danger:hover { background: #b91c1c; }

.btn-small { padding: 6px 12px; font-size: 12px; border-radius: 4px; }

.select-modern, .input-modern, .textarea-modern {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  font-size: 13px;
  color: #334155;
}

.select-modern:hover { border-color: #94a3b8; }
.input-modern:focus, .textarea-modern:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.textarea-modern {
  font-family: inherit;
  resize: vertical;
  width: 100%;
}

.size-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.size-input-modern {
  width: 70px;
  padding: 6px;
  border: none;
  background: transparent;
  font-size: 13px;
  text-align: center;
  color: #334155;
}

.size-input-modern:focus { outline: none; }
.size-separator { color: #94a3b8; }

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.checkbox-label:hover { background: #f1f5f9; }
.checkbox-label input { accent-color: #3b82f6; }
.checkbox-icon { width: 14px; height: 14px; }

.color-input {
  width: 100%;
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
}

.slider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  background: #e2e8f0;
  border-radius: 2px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.main-editor {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: #f1f5f9;
}

.layers-panel, .templates-panel {
  width: 340px;
  background: white;
  overflow-y: auto;
  flex-shrink: 0;
}

.layers-panel { border-right: 1px solid #e2e8f0; }
.templates-panel { border-left: 1px solid #e2e8f0; }

.panel-header {
  padding: 20px 20px 12px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.layer-count {
  background: #f1f5f9;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: #475569;
}

.layers-header {
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
}

.add-element-section { padding: 16px 20px; border-bottom: 1px solid #e2e8f0; }
.url-input-group { display: flex; gap: 8px; margin-top: 8px; }
.url-input-group .input-modern { flex: 1; }

.layers-list { max-height: 280px; overflow-y: auto; }
.layer-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
}
.layer-item:hover { background: #f8fafc; }
.layer-item.selected { background: #eff6ff; border-left: 3px solid #3b82f6; }
.layer-drag-handle { cursor: grab; opacity: 0.4; }
.layer-icon { width: 24px; display: flex; justify-content: center; }
.layer-info { flex: 1; }
.layer-name { font-size: 13px; font-weight: 500; color: #1e293b; }
.layer-type { font-size: 11px; color: #94a3b8; }
.layer-order-controls { display: flex; gap: 4px; }
.layer-order-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #94a3b8;
  border-radius: 4px;
  display: flex;
  align-items: center;
}
.layer-order-btn:hover { background: #e2e8f0; color: #3b82f6; }
.delete-layer-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #94a3b8;
  border-radius: 4px;
  display: flex;
  align-items: center;
}
.delete-layer-btn:hover { background: #fee2e2; color: #dc2626; }

.empty-layers {
  padding: 60px 20px;
  text-align: center;
  color: #94a3b8;
}

.properties-section { padding: 16px 20px; border-top: 1px solid #e2e8f0; }
.section-header { margin-bottom: 12px; }
.section-header h4 {
  font-size: 13px;
  font-weight: 600;
  color: #3b82f6;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 6px;
}
.property-group { margin-bottom: 12px; }
.property-label { display: block; font-size: 12px; color: #64748b; margin-bottom: 6px; }

.style-buttons { display: flex; gap: 8px; margin-bottom: 12px; }
.style-btn {
  width: 40px;
  padding: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
}
.style-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }

.canvas-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #e2e8f0;
  padding: 24px;
  overflow: auto;
}

.canvas-wrapper {
  display: inline-block;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.save-template-section { padding: 16px 20px; border-bottom: 1px solid #e2e8f0; }
.save-template-section .input-modern { margin-bottom: 8px; }

.templates-list { padding: 16px 20px; max-height: 320px; overflow-y: auto; }
.template-card {
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 8px;
}
.template-card:hover { background: #f1f5f9; transform: translateX(4px); }
.template-info { display: flex; justify-content: space-between; align-items: center; }
.template-name { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; }
.template-actions { display: flex; gap: 6px; }

.import-section { padding: 16px 20px; border-top: 1px solid #e2e8f0; }
.import-section .textarea-modern { margin-bottom: 8px; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

@media (max-width: 1200px) {
  .main-editor { flex-direction: column; }
  .layers-panel, .templates-panel {
    width: 100%;
    max-height: 350px;
    border: none;
    border-bottom: 1px solid #e2e8f0;
  }
}
</style>