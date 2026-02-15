let generatedImage = null;
let speakersData = []; // Array to store all speakers data
let bgImageData = null;
let sponsorsData = []; // Array to store sponsor logos

// Aspect ratio presets (width x height at base 800px width)
const aspectRatios = {
  '1:1': { width: 800, height: 800 },
  '4:5': { width: 800, height: 1000 },
  '9:16': { width: 800, height: 1422 },
  '16:9': { width: 800, height: 450 },
  '4:3': { width: 800, height: 600 },
  '3:4': { width: 800, height: 1067 },
  '21:9': { width: 800, height: 343 }
};

// Calculate scale factor based on canvas dimensions
function calculateScaleFactor(dimensions) {
  const baseHeight = 1000; // Base height for 4:5 ratio
  const heightScale = dimensions.height / baseHeight;
  return Math.max(0.4, Math.min(1.2, heightScale)); // Clamp between 0.4 and 1.2
}

// Update canvas dimensions based on selected aspect ratio
function updateCanvasDimensions() {
  updateFlyer();
}

// Initialize with default values
window.addEventListener('DOMContentLoaded', function() {
  // Load default background image
  fetch('image.png')
    .then(response => response.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onload = function(e) {
        bgImageData = e.target.result;
        document.getElementById('flyerBgImage').style.backgroundImage = `url(${bgImageData})`;
      };
      reader.readAsDataURL(blob);
    })
    .catch(err => console.log('No se pudo cargar image.png'));
  
  // Generate initial speaker forms
  generateSpeakerForms();
  generateSponsorForms();
  updateFlyer();
});

// Generate speaker forms dynamically
function generateSpeakerForms() {
  const numSpeakers = parseInt(document.getElementById('numSpeakers').value) || 0;
  const container = document.getElementById('speakersContainer');
  container.innerHTML = '';
  
  // Preserve existing data
  const existingSpeakers = [...speakersData];
  speakersData = [];
  
  for (let i = 0; i < numSpeakers; i++) {
    const section = document.createElement('div');
    section.className = 'form-section';
    section.innerHTML = `
      <h3>👤 Ponente ${i + 1}</h3>
      <div class="form-group">
        <label for="speaker${i}Image">Imagen del Ponente</label>
        <input type="file" id="speaker${i}Image" accept="image/*" onchange="handleSpeakerImage(${i}, event)" />
        <img id="speaker${i}Preview" class="image-preview" style="display: none;" />
        <small style="color: #666; font-size: 12px; margin-top: 5px; display: block;">💡 Arrastra para ajustar posición | Shift + Rueda para zoom</small>
      </div>
      <div class="form-group">
        <label for="speaker${i}Name">Nombre</label>
        <input type="text" id="speaker${i}Name" placeholder="Nombre del ponente" />
      </div>
      <div class="form-group">
        <label for="speaker${i}Role">Rol/Título</label>
        <input type="text" id="speaker${i}Role" placeholder="Rol o título" />
      </div>
      <div class="form-group">
        <label for="speaker${i}Company">Empresa</label>
        <input type="text" id="speaker${i}Company" placeholder="Nombre de la empresa" />
      </div>
    `;
    container.appendChild(section);
    
    // Initialize speaker data with position and zoom defaults
    speakersData[i] = existingSpeakers[i] || { 
      imageData: null, 
      positionX: 50, 
      positionY: 50,
      zoom: 100
    };
    
    // Restore existing data if available
    if (existingSpeakers[i]) {
      if (existingSpeakers[i].name) document.getElementById(`speaker${i}Name`).value = existingSpeakers[i].name;
      if (existingSpeakers[i].role) document.getElementById(`speaker${i}Role`).value = existingSpeakers[i].role;
      if (existingSpeakers[i].company) document.getElementById(`speaker${i}Company`).value = existingSpeakers[i].company;
      if (existingSpeakers[i].imageData) {
        document.getElementById(`speaker${i}Preview`).src = existingSpeakers[i].imageData;
        document.getElementById(`speaker${i}Preview`).style.display = 'block';
      }
    }
  }
  
  updateFlyer();
}

// Handle speaker image upload
function handleSpeakerImage(index, event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      speakersData[index].imageData = dataUrl;
      // Reset position and zoom when new image is uploaded
      speakersData[index].positionX = 50;
      speakersData[index].positionY = 50;
      speakersData[index].zoom = 100;
      document.getElementById(`speaker${index}Preview`).src = dataUrl;
      document.getElementById(`speaker${index}Preview`).style.display = 'block';
      updateFlyer();
    };
    reader.readAsDataURL(file);
  }
}

// Variables for image dragging
let draggedImageIndex = null;
let dragStartX = 0;
let dragStartY = 0;
let dragStartPosX = 0;
let dragStartPosY = 0;

// Setup drag listeners for a speaker image
function setupImageDrag(imgElement, index) {
  imgElement.addEventListener('mousedown', function(e) {
    e.preventDefault();
    draggedImageIndex = index;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartPosX = speakersData[index].positionX;
    dragStartPosY = speakersData[index].positionY;
    imgElement.classList.add('dragging');
    
    document.addEventListener('mousemove', onImageDrag);
    document.addEventListener('mouseup', onImageDragEnd);
  });
  
  // Add wheel event for zoom with Shift key
  imgElement.addEventListener('wheel', function(e) {
    if (e.shiftKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -5 : 5; // Scroll down = zoom out, scroll up = zoom in
      let newZoom = (speakersData[index].zoom || 100) + delta;
      
      // Clamp zoom between 50 and 200
      newZoom = Math.max(50, Math.min(200, newZoom));
      
      speakersData[index].zoom = newZoom;
      updateFlyer();
    }
  });
}

function onImageDrag(e) {
  if (draggedImageIndex === null) return;
  
  const deltaX = e.clientX - dragStartX;
  const deltaY = e.clientY - dragStartY;
  
  // Convert pixel movement to percentage (invert axis for intuitive dragging)
  const sensitivity = 0.2;
  const newPosX = Math.max(0, Math.min(100, dragStartPosX - deltaX * sensitivity));
  const newPosY = Math.max(0, Math.min(100, dragStartPosY - deltaY * sensitivity));
  
  speakersData[draggedImageIndex].positionX = newPosX;
  speakersData[draggedImageIndex].positionY = newPosY;
  
  updateFlyer();
}

function onImageDragEnd() {
  if (draggedImageIndex !== null) {
    const images = document.querySelectorAll('.flyer-speaker-image');
    images.forEach(img => img.classList.remove('dragging'));
    draggedImageIndex = null;
  }
  
  document.removeEventListener('mousemove', onImageDrag);
  document.removeEventListener('mouseup', onImageDragEnd);
}

document.getElementById('bgImage').addEventListener('change', function(event) {
  handleImageUpload(event, null, (dataUrl) => {
    bgImageData = dataUrl;
    document.getElementById('flyerBgImage').style.backgroundImage = `url(${dataUrl})`;
  });
});

function handleImageUpload(event, previewId, callback) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      if (previewId) {
        const preview = document.getElementById(previewId);
        preview.src = dataUrl;
        preview.style.display = 'block';
      }
      if (callback) callback(dataUrl);
    };
    reader.readAsDataURL(file);
  }
}

// Generate sponsor forms dynamically
function generateSponsorForms() {
  const numSponsors = parseInt(document.getElementById('numSponsors').value) || 0;
  const container = document.getElementById('sponsorsContainer');
  container.innerHTML = '';
  
  // Preserve existing data
  const existingSponsors = [...sponsorsData];
  sponsorsData = [];
  
  for (let i = 0; i < numSponsors; i++) {
    const section = document.createElement('div');
    section.className = 'form-section';
    section.innerHTML = `
      <h3>🏢 Patrocinador ${i + 1}</h3>
      <div class="form-group">
        <label for="sponsor${i}Logo">Logo del Patrocinador</label>
        <input type="file" id="sponsor${i}Logo" accept="image/*" onchange="handleSponsorLogo(${i}, event)" />
        <img id="sponsor${i}Preview" class="image-preview" style="display: none;" />
      </div>
    `;
    container.appendChild(section);
    
    // Initialize sponsor data
    sponsorsData[i] = existingSponsors[i] || { logoData: null };
    
    // Restore existing data if available
    if (existingSponsors[i] && existingSponsors[i].logoData) {
      document.getElementById(`sponsor${i}Preview`).src = existingSponsors[i].logoData;
      document.getElementById(`sponsor${i}Preview`).style.display = 'block';
    }
  }
  
  updateFlyer();
}

// Handle sponsor logo upload
function handleSponsorLogo(index, event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      sponsorsData[index].logoData = dataUrl;
      document.getElementById(`sponsor${index}Preview`).src = dataUrl;
      document.getElementById(`sponsor${index}Preview`).style.display = 'block';
      updateFlyer();
    };
    reader.readAsDataURL(file);
  }
}

function updateFlyer() {
  // Canvas dimensions based on aspect ratio
  const ratio = document.getElementById('aspectRatio').value;
  const dimensions = aspectRatios[ratio] || { width: 800, height: 800 };
  const flyer = document.getElementById('flyer');
  flyer.style.width = dimensions.width + 'px';
  flyer.style.height = dimensions.height + 'px';
  flyer.setAttribute('data-ratio', ratio);
  console.log('Ratio aplicado:', ratio, flyer.getAttribute('data-ratio'));
  
  // Calculate and apply scale factor
  const scaleFactor = calculateScaleFactor(dimensions);
  flyer.style.setProperty('--scale-factor', scaleFactor);
  
  // Adjust speaker image dimensions based on ratio
  const isWide = dimensions.width / dimensions.height > 1; // Horizontal format
  let speakerImageHeight = isWide ? 150 : 200;
  
  // En formato 9:16, hacer las imágenes de speakers más altas
  if (ratio === '9:16') {
    speakerImageHeight = 320;
  }
  
  // En formato 16:9, aumentar altura de las imágenes de speakers
  if (ratio === '16:9') {
    speakerImageHeight = 170;
  }
  
  // En formato 1:1, reducir altura de las imágenes de speakers
  if (ratio === '1:1') {
    speakerImageHeight = 160;
  }
  
  flyer.style.setProperty('--speaker-image-height', speakerImageHeight + 'px');

  // Title
  const mainTitle = document.getElementById('mainTitle').value || 'EL FUTURO DE LA IA';
  const titleFontSize = document.getElementById('titleFontSize').value || 42;
  const subtitle = document.getElementById('subtitle').value || 'MEETUP DE CIERRE 2025';
  const subtitleFontSize = document.getElementById('subtitleFontSize').value || 24;
  
  document.getElementById('flyerMainTitle').innerText = mainTitle;
  document.getElementById('flyerMainTitle').style.fontSize = titleFontSize + 'px';
  document.getElementById('flyerSubtitle').innerText = subtitle;
  document.getElementById('flyerSubtitle').style.fontSize = subtitleFontSize + 'px';

  // Date and Time
  const dayOfWeek = document.getElementById('dayOfWeek').value || 'MIERCOLES';
  const month = document.getElementById('month').value || 'Diciembre';
  const day = document.getElementById('day').value || '10';
  const year = document.getElementById('year').value || '2025';
  const time = document.getElementById('time').value || '6:30 p.m.';
  
  document.getElementById('flyerDayOfWeek').innerText = dayOfWeek;
  document.getElementById('flyerMonthDay').innerText = `${month} ${day}`;
  document.getElementById('flyerYear').innerText = year;
  document.getElementById('flyerTime').innerText = time;

  // Date/Time box colors
  const dateBoxColor = document.getElementById('dateBoxColor').value;
  const timeBoxColor = document.getElementById('timeBoxColor').value;
  document.getElementById('flyerDateBox').style.backgroundColor = dateBoxColor;
  document.getElementById('flyerTimeBox').style.backgroundColor = timeBoxColor;
  
  // Adjust text color for time box (if white background, use dark text)
  const timeBox = document.getElementById('flyerTimeBox');
  if (isLightColor(timeBoxColor)) {
    timeBox.style.color = '#000000';
  } else {
    timeBox.style.color = '#ffffff';
  }

  // Location
  const location1 = document.getElementById('location1').value || 'Universidad Tecnológica de Pereira';
  const location2 = document.getElementById('location2').value || 'Sala Magistral 1';
  document.getElementById('flyerLocation1').innerText = location1;
  document.getElementById('flyerLocation2').innerText = location2;

  // Speakers - Dynamic rendering
  const numSpeakers = parseInt(document.getElementById('numSpeakers').value) || 0;
  const speakersSection = document.getElementById('flyerSpeakersSection');
  speakersSection.innerHTML = '';
  
  for (let i = 0; i < numSpeakers; i++) {
    const nameInput = document.getElementById(`speaker${i}Name`);
    const roleInput = document.getElementById(`speaker${i}Role`);
    const companyInput = document.getElementById(`speaker${i}Company`);
    
    if (!nameInput) continue; // Skip if form doesn't exist yet
    
    const speakerName = nameInput.value || `Ponente ${i + 1}`;
    const speakerRole = roleInput.value || '';
    let speakerCompany = companyInput.value || '';
    
    // Add "en " prefix if not present
    if (speakerCompany && !speakerCompany.toLowerCase().startsWith('en ')) {
      speakerCompany = 'en ' + speakerCompany;
    }
    
    const speakerDiv = document.createElement('div');
    speakerDiv.className = 'flyer-speaker';
    
    const posX = speakersData[i]?.positionX || 50;
    const posY = speakersData[i]?.positionY || 50;
    const zoom = speakersData[i]?.zoom || 100;
    const imageData = speakersData[i]?.imageData || '';
    
    speakerDiv.innerHTML = `
      <div class="flyer-speaker-image" data-speaker-index="${i}" 
           style="background-image: url('${imageData}'); background-position: ${posX}% ${posY}%; background-size: ${zoom}%;"></div>
      <div class="flyer-speaker-info">
        <div class="flyer-speaker-name">${speakerName}</div>
        ${speakerRole ? `<div class="flyer-speaker-role">${speakerRole}</div>` : ''}
        ${speakerCompany ? `<div class="flyer-speaker-company">${speakerCompany}</div>` : ''}
      </div>
    `;
    speakersSection.appendChild(speakerDiv);
    
    // Setup drag for the image div
    const imgElement = speakerDiv.querySelector('.flyer-speaker-image');
    if (imgElement && speakersData[i]?.imageData) {
      setupImageDrag(imgElement, i);
    }
  }

  // Registration
  const registrationEmoji = document.getElementById('registrationEmoji').value || '🔔';
  const registrationHighlight = document.getElementById('registrationHighlight').value || 'NATILLA GRATIS';
  const registrationText = document.getElementById('registrationText').value || 'Regístrate en';
  const registrationUrl = document.getElementById('registrationUrl').value || 'luma.com/pertechtalks';
  
  // Apply horizontal layout for wide formats
  const registrationSection = document.querySelector('.flyer-registration-section');
  if (registrationSection) {
    // Ocultar la sección de registro en formato 16:9
    if (ratio === '16:9') {
      registrationSection.style.display = 'none';
    } else {
      registrationSection.style.display = 'flex';
      if (isWide) {
        registrationSection.classList.add('horizontal-layout');
      } else {
        registrationSection.classList.remove('horizontal-layout');
      }
    }
    
    // Always use grouped structure (solo si no es 16:9)
    if (ratio !== '16:9') {
      registrationSection.innerHTML = `
        <div class="registration-group-1">
          <div class="flyer-registration-emoji">${registrationEmoji}</div>
          <div class="flyer-registration-highlight">${registrationHighlight}</div>
        </div>
        <div class="registration-group-2">
          <div class="flyer-registration-text">${registrationText}</div>
          <div class="flyer-registration-url">${registrationUrl}</div>
        </div>
      `;
    }
  }

  // Sponsors
  const numSponsors = parseInt(document.getElementById('numSponsors').value) || 1;
  const sponsorsSection = document.getElementById('flyerSponsorsSection');
  sponsorsSection.innerHTML = '';
  
  // Always show sponsors section with title
  sponsorsSection.style.display = 'flex';
  
  // Add title
  const sponsorsTitle = document.createElement('div');
  sponsorsTitle.className = 'flyer-sponsors-title';
  sponsorsTitle.textContent = 'Apoyan';
  sponsorsSection.appendChild(sponsorsTitle);
  
  // Add logos container
  const logosContainer = document.createElement('div');
  logosContainer.className = 'flyer-sponsors-logos';
  
  for (let i = 0; i < numSponsors; i++) {
    if (sponsorsData[i] && sponsorsData[i].logoData) {
      const logoImg = document.createElement('img');
      logoImg.className = 'flyer-sponsor-logo';
      logoImg.src = sponsorsData[i].logoData;
      logoImg.alt = `Patrocinador ${i + 1}`;
      logosContainer.appendChild(logoImg);
    }
  }
  
  sponsorsSection.appendChild(logosContainer);

  // Design
  const backgroundColor = document.getElementById('backgroundColor').value;
  const bgOpacity = document.getElementById('bgOpacity').value || 80;
  const textColor = document.getElementById('textColor').value;
  const fontFamily = document.getElementById('fontFamily').value;
  
  // Apply solid background color to flyer
  document.getElementById('flyer').style.backgroundColor = backgroundColor;
  
  // Apply opacity to background image
  document.getElementById('flyerBgImage').style.opacity = bgOpacity / 100;
  
  // Apply text color and font
  document.getElementById('flyerContent').style.color = textColor;
  document.getElementById('flyerContent').style.fontFamily = fontFamily;
}

function isLightColor(color) {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

function generateImage() {
  html2canvas(document.getElementById('flyer'), {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    foreignObjectRendering: false,
    logging: false
  }).then(canvas => {
    generatedImage = canvas.toDataURL("image/png", 1.0);
    // Show modal with preview
    const modal = document.getElementById('previewModal');
    const modalImage = document.getElementById('modalPreviewImage');
    modalImage.src = generatedImage;
    modal.style.display = 'flex';
  });
}

function closePreviewModal() {
  const modal = document.getElementById('previewModal');
  modal.style.display = 'none';
}

// Close modal when clicking outside the content
window.onclick = function(event) {
  const modal = document.getElementById('previewModal');
  if (event.target === modal) {
    closePreviewModal();
  }
}

function downloadImage() {
  if (!generatedImage) {
    alert("Por favor, genera una vista previa primero.");
    return;
  }
  const a = document.createElement("a");
  a.href = generatedImage;
  a.download = "flyer.png";
  a.click();
}

function downloadFromModal() {
  if (!generatedImage) {
    alert("No hay imagen para descargar.");
    return;
  }
  const a = document.createElement("a");
  a.href = generatedImage;
  a.download = "flyer.png";
  a.click();
}

async function copyToClipboard() {
  if (!generatedImage) {
    alert("No hay imagen para copiar.");
    return;
  }
  
  try {
    // Convert base64 to blob
    const response = await fetch(generatedImage);
    const blob = await response.blob();
    
    // Copy to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob
      })
    ]);
    
    // Show success message
    const btn = document.getElementById('copyButton');
    const originalText = btn.innerHTML;
    btn.innerHTML = '✅ ¡Copiado!';
    btn.style.backgroundColor = '#10b981';
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.backgroundColor = '';
    }, 2000);
  } catch (err) {
    console.error('Error al copiar:', err);
    alert('No se pudo copiar al portapapeles. Tu navegador puede no soportar esta función.');
  }
}

function exportConfig() {
  const numSpeakers = parseInt(document.getElementById('numSpeakers').value) || 0;
  const speakers = [];
  
  for (let i = 0; i < numSpeakers; i++) {
    const nameInput = document.getElementById(`speaker${i}Name`);
    if (nameInput) {
      speakers.push({
        name: nameInput.value,
        role: document.getElementById(`speaker${i}Role`).value,
        company: document.getElementById(`speaker${i}Company`).value,
        imageData: speakersData[i]?.imageData || null,
        positionX: speakersData[i]?.positionX || 50,
        positionY: speakersData[i]?.positionY || 50,
        zoom: speakersData[i]?.zoom || 100
      });
    }
  }
  
  const numSponsors = parseInt(document.getElementById('numSponsors').value) || 0;
  const sponsors = [];
  
  for (let i = 0; i < numSponsors; i++) {
    if (sponsorsData[i]) {
      sponsors.push({
        logoData: sponsorsData[i].logoData || null
      });
    }
  }
  
  const config = {
    aspectRatio: document.getElementById('aspectRatio').value,
    mainTitle: document.getElementById('mainTitle').value,
    titleFontSize: document.getElementById('titleFontSize').value,
    subtitle: document.getElementById('subtitle').value,
    subtitleFontSize: document.getElementById('subtitleFontSize').value,
    dayOfWeek: document.getElementById('dayOfWeek').value,
    month: document.getElementById('month').value,
    day: document.getElementById('day').value,
    year: document.getElementById('year').value,
    time: document.getElementById('time').value,
    dateBoxColor: document.getElementById('dateBoxColor').value,
    timeBoxColor: document.getElementById('timeBoxColor').value,
    location1: document.getElementById('location1').value,
    location2: document.getElementById('location2').value,
    numSpeakers: numSpeakers,
    speakers: speakers,
    numSponsors: numSponsors,
    sponsors: sponsors,
    registrationEmoji: document.getElementById('registrationEmoji').value,
    registrationHighlight: document.getElementById('registrationHighlight').value,
    registrationText: document.getElementById('registrationText').value,
    registrationUrl: document.getElementById('registrationUrl').value,
    backgroundColor: document.getElementById('backgroundColor').value,
    bgOpacity: document.getElementById('bgOpacity').value,
    textColor: document.getElementById('textColor').value,
    fontFamily: document.getElementById('fontFamily').value,
    bgImage: bgImageData
  };

  const json = JSON.stringify(config, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'flyer-config.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importConfig() {
  const fileInput = document.getElementById('importConfigFile');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Por favor, selecciona un archivo JSON primero.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const config = JSON.parse(e.target.result);
      
      // Populate all fields
      document.getElementById('aspectRatio').value = config.aspectRatio || '4:5';
      document.getElementById('mainTitle').value = config.mainTitle || '';
      document.getElementById('titleFontSize').value = config.titleFontSize || 42;
      document.getElementById('subtitle').value = config.subtitle || '';
      document.getElementById('subtitleFontSize').value = config.subtitleFontSize || 24;
      document.getElementById('dayOfWeek').value = config.dayOfWeek || '';
      document.getElementById('month').value = config.month || '';
      document.getElementById('day').value = config.day || '';
      document.getElementById('year').value = config.year || '';
      document.getElementById('time').value = config.time || '';
      document.getElementById('dateBoxColor').value = config.dateBoxColor || '#2563eb';
      document.getElementById('timeBoxColor').value = config.timeBoxColor || '#ffffff';
      document.getElementById('location1').value = config.location1 || '';
      document.getElementById('location2').value = config.location2 || '';
      document.getElementById('registrationEmoji').value = config.registrationEmoji || '🔔';
      document.getElementById('registrationHighlight').value = config.registrationHighlight || '';
      document.getElementById('registrationText').value = config.registrationText || '';
      document.getElementById('registrationUrl').value = config.registrationUrl || '';
      document.getElementById('backgroundColor').value = config.backgroundColor || '#0a1628';
      document.getElementById('bgOpacity').value = config.bgOpacity || 80;
      document.getElementById('textColor').value = config.textColor || '#ffffff';
      document.getElementById('fontFamily').value = config.fontFamily || 'Helvetica, sans-serif';

      // Load speakers
      if (config.numSpeakers !== undefined) {
        document.getElementById('numSpeakers').value = config.numSpeakers;
        generateSpeakerForms();
        
        if (config.speakers && Array.isArray(config.speakers)) {
          config.speakers.forEach((speaker, index) => {
            if (document.getElementById(`speaker${index}Name`)) {
              document.getElementById(`speaker${index}Name`).value = speaker.name || '';
              document.getElementById(`speaker${index}Role`).value = speaker.role || '';
              document.getElementById(`speaker${index}Company`).value = speaker.company || '';
              
              if (speaker.imageData) {
                speakersData[index].imageData = speaker.imageData;
                speakersData[index].positionX = speaker.positionX !== undefined ? speaker.positionX : 50;
                speakersData[index].positionY = speaker.positionY !== undefined ? speaker.positionY : 50;
                speakersData[index].zoom = speaker.zoom !== undefined ? speaker.zoom : 100;
                document.getElementById(`speaker${index}Preview`).src = speaker.imageData;
                document.getElementById(`speaker${index}Preview`).style.display = 'block';
              }
            }
          });
        }
      }

      // Load sponsors
      if (config.numSponsors !== undefined) {
        document.getElementById('numSponsors').value = config.numSponsors;
        generateSponsorForms();
        
        if (config.sponsors && Array.isArray(config.sponsors)) {
          config.sponsors.forEach((sponsor, index) => {
            if (sponsor.logoData) {
              sponsorsData[index].logoData = sponsor.logoData;
              document.getElementById(`sponsor${index}Preview`).src = sponsor.logoData;
              document.getElementById(`sponsor${index}Preview`).style.display = 'block';
            }
          });
        }
      }

      // Load background image
      if (config.bgImage) {
        bgImageData = config.bgImage;
        document.getElementById('flyerBgImage').style.backgroundImage = `url(${config.bgImage})`;
      }

      // Update flyer
      updateFlyer();
      alert('Configuración importada exitosamente!');
    } catch (error) {
      alert('Error al importar configuración: ' + error.message);
    }
  };
  reader.readAsText(file);
}
