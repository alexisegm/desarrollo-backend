// Generador de Fichas de Contenido
function renderCards(containerId, cardsData) {
  const container = document.getElementById(containerId);
  if (!container) return;

  cardsData.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = 'topic-card';
    cardEl.innerHTML = `
      <h4>${card.title}</h4>
      <div class="card-content">
        <p><strong>¿Qué es?</strong> ${card.whatIs}</p>
        <p><strong>¿Qué resuelve?</strong> ${card.solves}</p>
        <p><strong>¿Qué NO resuelve?</strong> ${card.notSolves}</p>
        <div class="fictitious-example">
          <em>Ejemplo:</em> ${card.example}
        </div>
        <div class="traceability">
          <span class="badge ${card.traceType}">${card.traceLabel}</span>
          <span class="source-text">${card.source}</span>
        </div>
      </div>
    `;
    container.appendChild(cardEl);
  });
}
// Interacción 1: El "Cadenero" de la API (AuthN vs AuthZ)
function initBouncerInteraction() {
  const container = document.getElementById('bouncer-app');
  if (!container) return;

  // Inyectamos la interfaz de la interacción
  container.innerHTML = `
    <div class="interaction-ui">
      <div class="control-group">
        <label><strong>1. Identidad (AuthN):</strong> ¿Quién eres?</label>
        <select id="bouncer-authn">
          <option value="anonimo">Desconocido (Sin credenciales)</option>
          <option value="identificado">Usuario Identificado (Pasaporte válido)</option>
        </select>
      </div>
      
      <div class="control-group">
        <label><strong>2. Permisos (AuthZ):</strong> ¿Qué puedes hacer?</label>
        <select id="bouncer-authz">
          <option value="basico">Acceso Básico (Boleto estándar)</option>
          <option value="vip">Acceso VIP (Pase especial)</option>
        </select>
      </div>

      <div class="actions">
        <button id="bouncer-btn" class="btn-primary">Intentar entrar a Zona VIP</button>
        <button id="bouncer-reset" class="btn-secondary">Reiniciar</button>
      </div>

      <div id="bouncer-result" class="result-box" style="display: none;"></div>
    </div>
  `;

  // Lógica de validación
  const btn = document.getElementById('bouncer-btn');
  const resetBtn = document.getElementById('bouncer-reset');
  const resultDiv = document.getElementById('bouncer-result');
  const authnSelect = document.getElementById('bouncer-authn');
  const authzSelect = document.getElementById('bouncer-authz');

  btn.addEventListener('click', () => {
    const isAuthN = authnSelect.value === 'identificado';
    const isAuthZ = authzSelect.value === 'vip';
    
    resultDiv.style.display = 'block';

    if (!isAuthN) {
      // Falla la autenticación
      resultDiv.className = 'result-box error-401';
      resultDiv.innerHTML = `<strong>⛔ 401 Unauthorized:</strong> El sistema no sabe quién eres. La validación se detiene aquí sin importar qué permisos hayas seleccionado. <em>(Falta AuthN)</em>.`;
    } else if (!isAuthZ) {
      // Falla la autorización
      resultDiv.className = 'result-box error-403';
      resultDiv.innerHTML = `<strong>⚠️ 403 Forbidden:</strong> El sistema sabe perfectamente quién eres (AuthN exitosa), pero no tienes el nivel de acceso requerido para entrar a la Zona VIP. <em>(Falta AuthZ)</em>.`;
    } else {
      // Éxito
      resultDiv.className = 'result-box success-200';
      resultDiv.innerHTML = `<strong>✅ 200 OK:</strong> Eres un usuario válido y tienes los permisos necesarios. Acceso concedido a la Zona VIP.`;
    }
  });

  resetBtn.addEventListener('click', () => {
    authnSelect.value = 'anonimo';
    authzSelect.value = 'basico';
    resultDiv.style.display = 'none';
  });
}

// Inicializamos la interacción
initBouncerInteraction();

// Interacción 2: Simulador Forense de JWT
function initJWTInteraction() {
  const container = document.getElementById('jwt-app');
  if (!container) return;

  // Datos ficticios iniciales
  const originalPayload = {
    sub: "user_9921",
    name: "Estudiante Ficticio",
    role: "visitor"
  };
  
  const originalPayloadStr = JSON.stringify(originalPayload, null, 2);

  container.innerHTML = `
    <div class="interaction-ui">
      <p style="margin-top: 0; color: #98a0b3; font-size: 0.9rem;">
        Un JWT tiene 3 partes separadas por puntos: <span style="color:#ff4d4d">Header</span>.<span style="color:#b87dff">Payload</span>.<span style="color:#4dff8a">Signature</span>
      </p>
      
      <div class="control-group">
        <label><strong>Payload (Decodificado):</strong> ¡Puedes editarlo!</label>
        <textarea id="jwt-payload-input" rows="5" style="font-family: monospace;">${originalPayloadStr}</textarea>
      </div>

      <div class="actions">
        <button id="jwt-verify-btn" class="btn-primary">Verificar Token en el Backend</button>
        <button id="jwt-reset-btn" class="btn-secondary">Restaurar Original</button>
      </div>

      <div id="jwt-result" class="result-box" style="display: none;"></div>
    </div>
  `;

  const payloadInput = document.getElementById('jwt-payload-input');
  const verifyBtn = document.getElementById('jwt-verify-btn');
  const resetBtn = document.getElementById('jwt-reset-btn');
  const resultDiv = document.getElementById('jwt-result');

  verifyBtn.addEventListener('click', () => {
    const currentPayload = payloadInput.value;
    resultDiv.style.display = 'block';

    // Para evitar errores si el usuario borra todo o escribe mal el JSON
    try {
      JSON.parse(currentPayload); 
    } catch (e) {
      resultDiv.className = 'result-box error-401';
      resultDiv.innerHTML = `<strong>⚠️ Error de formato:</strong> El JSON ingresado no es válido.`;
      return;
    }

    if (currentPayload !== originalPayloadStr) {
      // Si el texto cambió, la firma ya no coincide con el contenido
      resultDiv.className = 'result-box error-401';
      resultDiv.innerHTML = `<strong>⛔ 401 Unauthorized (Firma Inválida):</strong> Alguien ha modificado el payload (los datos). Como la firma criptográfica se calculó con los datos originales, el servidor detecta la manipulación y rechaza el token. <em>Firmado no significa cifrado.</em>`;
    } else {
      // Si el texto es idéntico al original, la firma es válida
      resultDiv.className = 'result-box success-200';
      resultDiv.innerHTML = `<strong>✅ 200 OK (Firma Válida):</strong> Los datos coinciden perfectamente con la firma criptográfica. El token es auténtico y no ha sido alterado.`;
    }
  });

  resetBtn.addEventListener('click', () => {
    payloadInput.value = originalPayloadStr;
    resultDiv.style.display = 'none';
  });
}

// Inicializamos la interacción
initJWTInteraction();

// Interacción 3: Árbol de Decisión de Arquitectura
function initDecisionTree() {
  const container = document.getElementById('decision-app');
  if (!container) return;

  // Definimos las preguntas y los resultados del árbol
  const treeData = {
    q1: {
      text: "¿Necesitas que aplicaciones de TERCEROS accedan a tus recursos en nombre de tus usuarios? (Ej. 'Iniciar sesión con tu App' en otras plataformas).",
      yes: "res_oauth",
      no: "q2"
    },
    q2: {
      text: "¿Tu aplicación está diseñada estrictamente para que otros servidores o máquinas se comuniquen con ella (Machine-to-Machine), sin intervención humana?",
      yes: "res_apikey",
      no: "q3"
    },
    q3: {
      text: "¿Tienes un equipo dedicado a ciberseguridad, presupuesto amplio y una necesidad estricta de que los datos de identidad jamás salgan de tus propios servidores?",
      yes: "res_custom",
      no: "res_managed"
    }
  };

  const resultsData = {
    res_oauth: {
      title: "Autorización Delegada (OAuth 2.0)",
      desc: "Debes implementar <strong>OAuth 2.0</strong>. Este estándar es exactamente para eso: permite a los usuarios dar permiso a aplicaciones de terceros para acceder a sus datos sin compartir sus credenciales."
    },
    res_apikey: {
      title: "API Keys / Client Credentials",
      desc: "Utiliza <strong>API Keys</strong> o el flujo <em>Client Credentials</em> de OAuth 2.0. Las API keys son ideales para identificar aplicaciones y servicios backend, no identidades humanas."
    },
    res_custom: {
      title: "Autenticación Propia (On-Premise)",
      desc: "Construye tu propio sistema gestionando el almacenamiento de hashes (ej. con Argon2) y sesiones. <strong>Advertencia:</strong> El riesgo es muy alto. Eres 100% responsable de las brechas de seguridad, políticas de contraseñas y flujos de recuperación."
    },
    res_managed: {
      title: "Proveedor de Identidad Gestionado (IdP / OIDC)",
      desc: "Usa un <strong>Proveedor de Identidad Gestionado</strong> (como Auth0, Firebase, Cognito) mediante <strong>OpenID Connect (OIDC)</strong>. Te ahorra la carga de encriptar contraseñas, mantener la seguridad de las sesiones y te permite implementar MFA o Passkeys fácilmente."
    }
  };

  container.innerHTML = `
    <div class="interaction-ui">
      <div id="tree-question-container" class="control-group">
        <label id="tree-question-text" style="font-size: 1.1rem; color: #e8eaf0;">Cargando pregunta...</label>
      </div>

      <div id="tree-actions" class="actions">
        <button id="tree-btn-yes" class="btn-primary" style="background: #4dff8a; color: #0f1117;">Sí</button>
        <button id="tree-btn-no" class="btn-primary" style="background: #ff4d4d;">No</button>
      </div>

      <div id="tree-result" class="result-box" style="display: none;"></div>
      
      <div class="actions" style="margin-top: 1rem;">
        <button id="tree-reset" class="btn-secondary" style="display: none;">Volver a empezar</button>
      </div>
    </div>
  `;

  const qText = document.getElementById('tree-question-text');
  const btnYes = document.getElementById('tree-btn-yes');
  const btnNo = document.getElementById('tree-btn-no');
  const resultDiv = document.getElementById('tree-result');
  const actionsDiv = document.getElementById('tree-actions');
  const resetBtn = document.getElementById('tree-reset');

  let currentNode = "q1";

  function renderNode(nodeId) {
    if (treeData[nodeId]) {
      // Es una pregunta
      qText.innerHTML = `<strong>Pregunta:</strong> ${treeData[nodeId].text}`;
      actionsDiv.style.display = "flex";
      resultDiv.style.display = "none";
      resetBtn.style.display = "none";
    } else if (resultsData[nodeId]) {
      // Es un resultado
      qText.innerHTML = "<strong>Veredicto Arquitectónico:</strong>";
      actionsDiv.style.display = "none";
      resultDiv.style.display = "block";
      resultDiv.className = 'result-box success-200';
      resultDiv.innerHTML = `<strong>🎯 ${resultsData[nodeId].title}</strong><br><br>${resultsData[nodeId].desc}`;
      resetBtn.style.display = "block";
    }
  }

  btnYes.addEventListener('click', () => {
    currentNode = treeData[currentNode].yes;
    renderNode(currentNode);
  });

  btnNo.addEventListener('click', () => {
    currentNode = treeData[currentNode].no;
    renderNode(currentNode);
  });

  resetBtn.addEventListener('click', () => {
    currentNode = "q1";
    renderNode(currentNode);
  });

  // Inicializar primera pregunta
  renderNode(currentNode);
}

// Inicializamos la interacción
initDecisionTree();

// ==========================================
// PASO 4: INYECCIÓN DE CONTENIDO (FICHAS)
// ==========================================

// Datos para el Bloque 1: Fundamentos de Identidad y Acceso
const fundamentosData = [
  {
    title: "1. Identidad Digital",
    whatIs: "Es el conjunto de atributos y datos que representan a una entidad (persona, sistema o dispositivo) en un entorno digital. Actúa como el 'quién' dentro del sistema.",
    solves: "Permite distinguir a un usuario de otro dentro de un ecosistema o base de datos.",
    notSolves: "No demuestra que la persona frente a la pantalla sea realmente la dueña de esa identidad.",
    example: "El identificador de base de datos 'user_4491' o el nombre de usuario 'admin_ficticio'.",
    traceType: "dato",
    traceLabel: "DATO",
    source: "NIST SP 800-63-3 (Digital Identity Guidelines)."
  },
  {
    title: "2. Autenticación (AuthN)",
    whatIs: "Es el proceso de verificar que la entidad que reclama una identidad digital es legítima mediante la presentación de pruebas (credenciales).",
    solves: "Evita la suplantación de identidad al exigir un factor de comprobación (algo que sabes, tienes o eres).",
    notSolves: "No determina qué acciones puede realizar el usuario una vez que ha ingresado al sistema. AuthN ≠ AuthZ.",
    example: "Ingresar la contraseña 'P@ssw0rd_Test' para demostrar que controlas la identidad 'user_4491'.",
    traceType: "interpretacion",
    traceLabel: "INTERPRETACIÓN",
    source: "Concepto estándar derivado de RFC 4949."
  },
  {
    title: "3. Autorización (AuthZ)",
    whatIs: "Es el proceso de determinar si una identidad previamente autenticada tiene los permisos necesarios para acceder a un recurso o ejecutar una acción.",
    solves: "Protege los recursos del sistema garantizando que solo los usuarios con los roles adecuados puedan leerlos o modificarlos.",
    notSolves: "No identifica al usuario ni verifica sus credenciales iniciales.",
    example: "El backend rechaza (403) un intento de borrar un registro porque 'user_4491' tiene el rol 'lector' y no 'editor'.",
    traceType: "dato",
    traceLabel: "DATO",
    source: "RFC 4949 (Internet Security Glossary)."
  },
  {
    title: "4. Auditoría",
    whatIs: "Es el registro cronológico y sistemático de las actividades y eventos de seguridad en un sistema. Permite rastrear quién hizo qué, cuándo y desde dónde.",
    solves: "Proporciona evidencia forense para investigar incidentes, detectar comportamientos anómalos y cumplir con normativas.",
    notSolves: "No previene los ataques en tiempo real, solo registra que ocurrieron.",
    example: "Un archivo de log que indica: '2026-09-20 10:15 - Fallo de AuthN para user_4491 desde IP 192.168.1.50'.",
    traceType: "decision",
    traceLabel: "DECISIÓN",
    source: "Decisión de diseño: Todo evento crítico de autenticación debe dejar rastro inmutable."
  }
];

// Inyectamos las fichas en el contenedor correspondiente del HTML
renderCards('grid-fundamentos', fundamentosData);
// Datos para el Bloque 2: Mecanismos Tradicionales y Modernos
const mecanismosData = [
  {
    title: "5. Passwords",
    whatIs: "Es una cadena de caracteres secreta que funciona como un factor de conocimiento para la autenticación.",
    solves: "Proporciona una barrera básica para demostrar la identidad basada en 'algo que sabes'.",
    notSolves: "No es suficiente por sí sola contra el phishing, la fuerza bruta o el reciclaje de claves si no se usa MFA.",
    example: "Almacenar el hash de la contraseña 'P@ssw0rd_Test' usando un algoritmo robusto como Argon2.",
    traceType: "dato",
    traceLabel: "DATO",
    source: "NIST SP 800-63B (Authentication and Lifecycle Management)."
  },
  {
    title: "6. Sesiones",
    whatIs: "Es un estado temporal que se mantiene entre el cliente y el servidor después de una autenticación exitosa.",
    solves: "Evita que el usuario deba enviar sus credenciales en cada solicitud HTTP (el protocolo HTTP es stateless por naturaleza).",
    notSolves: "Requiere almacenamiento y gestión de estado en el backend (memoria, base de datos o Redis), lo que dificulta escalar horizontalmente sin configuraciones extra.",
    example: "Un registro en Redis que vincula el identificador temporal 'session_778' con 'user_4491'.",
    traceType: "dato",
    traceLabel: "DATO",
    source: "OWASP Session Management Cheat Sheet."
  },
  {
    title: "7. Cookies",
    whatIs: "Son pequeños fragmentos de datos que el servidor envía al navegador, y que el navegador devuelve automáticamente en peticiones posteriores al mismo dominio.",
    solves: "Es el mecanismo de transporte estándar para enviar identificadores de sesión de forma segura (usando flags HttpOnly y Secure).",
    notSolves: "No protegen automáticamente contra ataques CSRF si no se configuran correctamente (atributo SameSite).",
    example: "El navegador enviando automáticamente 'Cookie: session_id=abc123xyz' al solicitar la página de perfil.",
    traceType: "dato",
    traceLabel: "DATO",
    source: "RFC 6265 (HTTP State Management Mechanism)."
  },
  {
    title: "8. Bearer tokens",
    whatIs: "Un token de seguridad con la propiedad de que cualquier entidad que lo posea ('el portador') puede usarlo para acceder a los recursos.",
    solves: "Permite la autorización sin necesidad de mantener el estado de la sesión en el servidor, ideal para APIs y microservicios.",
    notSolves: "Si un atacante roba el token, puede suplantar al usuario legítimo hasta que expire. No prueba la posesión de una clave criptográfica.",
    example: "Un encabezado HTTP en la petición: 'Authorization: Bearer mF_9.B5f-4.1JqM'.",
    traceType: "dato",
    traceLabel: "DATO",
    source: "RFC 6750 (The OAuth 2.0 Authorization Framework: Bearer Token Usage)."
  },
  {
    title: "9. JWT (JSON Web Token)",
    whatIs: "Un estándar para transmitir información estructurada en JSON. Fundamental: JWT es un formato, no una solución completa de autenticación[cite: 1].",
    solves: "Permite verificar la integridad de los datos mediante una firma criptográfica, previniendo manipulaciones por parte del cliente.",
    notSolves: "Firmado no significa cifrado[cite: 1]. Cualquiera puede decodificar y leer el payload en Base64. Además, decodificar el token no significa verificar su firma[cite: 1].",
    example: "El token de nuestro simulador forense, que demostró cómo la firma se invalida si se altera el payload.",
    traceType: "interpretacion",
    traceLabel: "INTERPRETACIÓN",
    source: "Aclaración crítica basada en RFC 7519 y malas prácticas de la industria."
  },
  {
    title: "10. API keys",
    whatIs: "Cadenas alfanuméricas estáticas pasadas por un cliente al hacer una petición a una API para identificarse.",
    solves: "Identifican al proyecto, aplicación o servicio que hace la llamada, siendo útiles para rate limiting o facturación.",
    notSolves: "Suelen identificar aplicaciones, no reemplazan la identidad del usuario[cite: 1]. No son seguras para acceso desde navegadores porque no pueden ocultarse.",
    example: "Un servidor backend consultando un servicio de clima con la URL '?api_key=4491_fictional_key'.",
    traceType: "decision",
    traceLabel: "DECISIÓN",
    source: "Restringir API keys estrictamente para comunicación de servidor a servidor (M2M)."
  }
];

renderCards('grid-mecanismos', mecanismosData);
// Datos para el Bloque 3: Terceros y Estándares
const estandaresData = [
  {
    title: "11. OAuth 2.0",
    whatIs: "Es un framework de delegación de acceso. Aclaración obligatoria: OAuth trata sobre autorización delegada, no sobre autenticación[cite: 1].",
    solves: "Permite a una aplicación acceder a los recursos de un usuario en otro servicio, sin que el usuario tenga que compartir su contraseña.",
    notSolves: "No proporciona un mecanismo estándar para saber quién es el usuario autenticado (no devuelve un perfil de identidad predecible).",
    example: "Una app web pidiendo permiso para leer tus repositorios privados de 'GitHub_Ficticio', sin conocer tu clave.",
    traceType: "dato",
    traceLabel: "DATO",
    source: "RFC 6749 (The OAuth 2.0 Authorization Framework)."
  },
  {
    title: "12. OpenID Connect (OIDC)",
    whatIs: "Es una capa de identidad construida sobre el protocolo OAuth 2.0. Aclaración obligatoria: OpenID Connect añade identidad encima de la autorización[cite: 1].",
    solves: "Estandariza la forma en que los clientes obtienen el perfil del usuario (mediante un ID Token en formato JWT) después de autenticarse.",
    notSolves: "Sigue dependiendo de que el usuario se autentique correctamente ante el proveedor; hereda las vulnerabilidades si el proveedor falla.",
    example: "El botón de 'Iniciar sesión con un Proveedor Ficticio' devolviendo un ID Token que certifica que eres 'user_4491' junto con tu email.",
    traceType: "dato",
    traceLabel: "DATO",
    source: "OpenID Connect Core 1.0 Specification."
  },
  {
    title: "13. MFA (Autenticación Multifactor)",
    whatIs: "Es un mecanismo que requiere dos o más piezas de evidencia (factores) independientes para verificar una identidad.",
    solves: "Mitiga drásticamente el impacto de contraseñas robadas o comprometidas.",
    notSolves: "No protege completamente contra ataques avanzados de intermediario (Man-in-the-Middle o AiTM) si los factores usados son interceptables, como los SMS.",
    example: "Ingresar tu contraseña y luego un código temporal (TOTP) generado en tu aplicación de autenticación móvil.",
    traceType: "interpretacion",
    traceLabel: "INTERPRETACIÓN",
    source: "CISA (Cybersecurity & Infrastructure Security Agency) MFA Guidance."
  },
  {
    title: "14. Passkeys",
    whatIs: "Son credenciales digitales vinculadas a un dispositivo que usan criptografía de clave pública (WebAuthn) para autenticar a los usuarios sin contraseñas.",
    solves: "Elimina la vulnerabilidad al phishing y la necesidad de recordar contraseñas, apoyándose en la biometría o el PIN del dispositivo local.",
    notSolves: "Puede generar fricción de usabilidad si el usuario pierde el dispositivo y no existe un mecanismo robusto de recuperación (cross-device sync).",
    example: "Desbloquear el acceso a la web de una bóveda ficticia usando el lector de huellas de tu teléfono móvil.",
    traceType: "dato",
    traceLabel: "DATO",
    source: "FIDO Alliance & W3C WebAuthn Standards."
  },
  {
    title: "15. Proveedores de Identidad (IdP)",
    whatIs: "Son servicios externos que crean, mantienen y gestionan la información de identidad y proporcionan autenticación a otras aplicaciones.",
    solves: "Centraliza la gestión de usuarios, simplificando el desarrollo y mejorando la seguridad al delegar el riesgo a expertos.",
    notSolves: "Introduce un punto único de fallo y una dependencia técnica (vendor lock-in) para el acceso a tu propia aplicación.",
    example: "Usar un servicio gestionado como Auth0 o Firebase Authentication en nuestro proyecto en lugar de crear nuestra propia tabla de usuarios.",
    traceType: "decision",
    traceLabel: "DECISIÓN",
    source: "Decisión arquitectónica: Delegar el riesgo criptográfico a entidades especializadas es preferible en etapas tempranas."
  }
];

renderCards('grid-estandares', estandaresData);
// Datos para el Bloque 4: Arquitectura y Decisiones
const arquitecturaData = [
  {
    title: "16. Propia vs Gestionada",
    whatIs: "El debate arquitectónico sobre construir el sistema de autenticación desde cero frente a delegarlo a un servicio especializado (Identity-as-a-Service).",
    solves: "Ayuda a balancear el tiempo de desarrollo, el presupuesto y la responsabilidad legal sobre los datos.",
    notSolves: "Usar un servicio gestionado no te exime de asegurar tus propios endpoints. Como dice la regla: ocultar botones no protege el backend[cite: 1].",
    example: "Elegir Supabase Auth o Clerk (gestionado) en lugar de programar tu propia tabla de contraseñas con bcrypt en el backend.",
    traceType: "decision",
    traceLabel: "DECISIÓN",
    source: "Principio de diseño: No siempre conviene construir autenticación propia por el alto riesgo de implementación[cite: 1]."
  },
  {
    title: "17. Riesgos Comunes",
    whatIs: "Vulnerabilidades típicas en sistemas de identidad, como inyección SQL, fuerza bruta, enumeración de usuarios o exposición de tokens en el frontend.",
    solves: "Conocerlos permite aplicar mitigaciones preventivas (estrategia de Defensa en Profundidad).",
    notSolves: "Identificar el riesgo en la teoría no parchea automáticamente tu código.",
    example: "Un atacante descubriendo qué correos están registrados porque el login dice 'Contraseña incorrecta' en lugar de 'Credenciales inválidas'.",
    traceType: "dato",
    traceLabel: "DATO",
    source: "OWASP Top 10 (A07:2021 - Identification and Authentication Failures)."
  },
  {
    title: "18. Casos de Uso",
    whatIs: "Escenarios prácticos (B2C, B2B, Machine-to-Machine) que determinan qué mecanismo de seguridad debe aplicarse.",
    solves: "Alinea las necesidades reales del negocio con la arquitectura técnica correcta, evitando sobreingeniería.",
    notSolves: "Un caso de uso genérico no sustituye el modelado de amenazas específico de tu aplicación.",
    example: "Un cronjob nocturno que limpia la base de datos (M2M) usa una API Key estática, mientras que un usuario humano usa OIDC.",
    traceType: "interpretacion",
    traceLabel: "INTERPRETACIÓN",
    source: "Patrones de diseño estándar en arquitecturas de microservicios."
  },
  {
    title: "19. Árbol de Decisión",
    whatIs: "Herramienta lógica (como nuestra Interacción 3) para seleccionar mecanismos basados en requerimientos excluyentes.",
    solves: "Evita aplicar 'una solución para todo' guiando al desarrollador a través de preguntas críticas de descarte.",
    notSolves: "No cubre el 100% de los casos extremos corporativos (edge cases).",
    example: "Si la app necesita acceso delegado, la ruta del árbol descarta 'Autenticación Propia' y dirige hacia 'OAuth 2.0'.",
    traceType: "decision",
    traceLabel: "DECISIÓN",
    source: "Estructurado para simplificar la toma de decisiones basada en los estándares RFC."
  }
];

// Datos para el Bloque 5: Fuentes (Tema 20)
const fuentesData = [
  {
    title: "20. Fuentes y Metodología",
    whatIs: "El registro documentado de dónde proviene cada afirmación técnica, diferenciando hechos concretos de interpretaciones personales.",
    solves: "Garantiza que el contenido sea verificable, demostrando que la investigación usa fuentes primarias o autoritativas.",
    notSolves: "Citar una fuente no hace que una mala implementación técnica sea segura.",
    example: "El sistema de insignias (DATO, INTERPRETACIÓN, DECISIÓN) visible al pie de cada tarjeta en este portal.",
    traceType: "dato",
    traceLabel: "DATO",
    source: "Requisito estricto de la Rúbrica 05B para trazabilidad."
  }
];

renderCards('grid-arquitectura', arquitecturaData);
renderCards('fuentes-lista', fuentesData);