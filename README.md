# 📱 CRM Comercial B2B & Oportunidades EPC (Ingeniería y Construcción)

Aplicación móvil moderna (PWA) diseñada para el seguimiento comercial de **Empresas Clientes en sectores industriales, energía e infraestructura**, gestión de carteras de **Oportunidades (E, EPC, EP, C)**, directorio de **Contactos Clave**, y **Bitácora de Seguimiento con Notas de Voz, Transcripción Automática y Resúmenes Ejecutivos**.

---

## 🏢 Estructura de Datos de la Aplicación

### 1. Ficha de Empresa Cliente
- **Nombre de la Empresa**
- **Segmento Industrial:**
  - `Power`
  - `Oil&Gas`
  - `Infraestructura`
  - `Transición Energética`
  - `Ductos`
  - `Siderurgia`
  - `Minería`
  - `Otros`
- **Geografía / Región:**
  - `Norte` (México, Centroamérica, USA)
  - `Andina` (Colombia, Perú, Ecuador)
  - `Brasil`
  - `Sur` (Argentina, Chile, Cono Sur)
- **Sitio Web:** Enlace directo con un solo toque.
- **Descripción de la Empresa:** Alcance, plantas, presencia y capacidades.
- **Logo de la Empresa:** Carga directa de imagen (PNG, JPG, SVG) almacenada de forma persistente.

---

### 2. Personas de Contacto (Por Empresa)
Al abrir cualquier empresa puedes registrar múltiples contactos clave:
- **Nombre Completo**
- **Cargo / Puesto** (ej. Director de Licitaciones, Gerente de Compras)
- **Teléfono / Móvil:** Botones directos con un toque para **abrir WhatsApp con mensaje redactado** o **Llamar**.
- **Correo Electrónico:** Botón para redactar correo electrónico.
- **Comentarios:** Notas sobre el perfil, rol de decisión y disponibilidad.

---

### 3. Oportunidades Comerciales (Por Empresa)
Gestión completa de proyectos y licitaciones:
- **Nombre de la Oportunidad / Proyecto** (ej. *Gasoducto Troncal Vaca Muerta 36"* o *Parque Solar 250 MW*)
- **Tipo de Oportunidad:** Licitación Privada, Licitación Pública, Asignación Directa, Contrato Marco, Adenda / Ampliación, Alianza / Consorcio.
- **Alcance Contractual:**
  - `EPC` *(Engineering, Procurement & Construction)*
  - `E` *(Solo Ingeniería)*
  - `EP` *(Ingeniería y Procura)*
  - `C` *(Solo Construcción)*
  - `PMC` / `O&M`
- **Importe Estimado:** Cifra en dólares ($ USD).
- **Fecha Límite de Entrega de Oferta:** Seguimiento de plazos y vencimientos.
- **Descripción Técnica:** Alcance, consorcios y requerimientos especiales.

---

### 4. 🎙️ Seguimiento con Notas de Voz, Transcripción y Resumen
- **Registro Cronológico:** Bitácora de seguimiento fechada por empresa y canal (Reunión presencial, Videollamada, Llamada, WhatsApp, Visita técnica).
- **Grabador de Audio Nativo:** Graba notas de voz con el micrófono del teléfono o computadora. Permite reproducir el audio grabado en cualquier momento.
- **Transcripción de Voz en Tiempo Real:** Utiliza la API nativa de reconocimiento de voz del navegador (*Web Speech API*) para transcribir al español lo que dices mientras hablas.
- **✨ Resumen Ejecutivo Automático:** Analiza el texto transcrito y genera una síntesis estructurada con:
  - 📌 **Puntos Clave / Temas Tratados**
  - 🤝 **Acuerdos y Compromisos Detectados**
  - 🎯 **Próximo Paso Inmediato y Fecha de Seguimiento**

---

---

## 🧭 Flujo de Registro y Creación Rápida

1. **🔘 Botón Flotante Principal (+):**
   - Siempre abre el registro de una **Nueva Acción Comercial / Seguimiento**.
   - Te permite seleccionar la **Empresa Cliente** de tu cartera.
   - Filtra y carga automáticamente las **Personas de Contacto** de esa empresa.
   - Permite registrar notas de texto o **grabar notas de voz con transcripción automática y resumen ejecutivo**, fecha, canal y próximo compromiso.

2. **🏢 Menú / Pestaña "Empresas":**
   - Cuenta con el botón superior **`+ Nueva Empresa`** para registrar una nueva cuenta comercial con su segmento, geografía, logo, web y descripción.

3. **📑 Pestaña "Oportunidades":**
   - Cuenta con el botón **`+ Nueva Oportunidad`** para crear licitaciones o proyectos (EPC, E, etc.), seleccionando la **Empresa Cliente** asociada y especificando el importe ($ USD), fecha de entrega y alcance.

---

## 🚀 Cómo Abrir e Instalar la Aplicación

### En tu Computadora:
- Haz doble clic en el archivo [**`index.html`**](file:///c:/Users/gonzalezsanchezj/OneDrive%20-%20Techint%20E&C/Desktop/JGS/PERSONAL/PRUEBA%20ANTIGRAVITY/index.html).
- Se abrirá en tu navegador predeterminado (Chrome, Edge) con una interfaz adaptada como teléfono móvil.
- Para simular exactamente la pantalla táctil de un smartphone, pulsa `F12` y activa la vista de dispositivos (`Ctrl + Shift + M`).

### En tu Celular (Android / iPhone):
1. **Android (Chrome):** Abre la dirección de la app, pulsa en el menú (`⋮`) y elige **"Instalar aplicación"** o **"Agregar a pantalla principal"**.
2. **iPhone (Safari):** Abre la app, toca el botón de Compartir y selecciona **"Agregar al inicio"**.
3. La aplicación se ejecutará a pantalla completa como una app nativa, con acceso directo y soporte sin conexión (*offline*).

---

## 💾 Respaldo y Compatibilidad con Excel
- **Exportar a Excel (CSV):** Descarga el listado consolidado de empresas y montos en cartera con codificación UTF-8 compatible con Microsoft Excel.
- **Copia de Seguridad (.json):** Descarga una copia íntegra con todas las empresas, logos, contactos, oportunidades y notas de voz para restaurar en cualquier equipo.
