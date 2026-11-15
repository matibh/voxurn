# Voxurn — checklist legal y operativo previo al lanzamiento

**Estado: NO APTO PARA DECLARAR CUMPLIMIENTO COMPLETO.** Identifica faltantes; no afirma que estén implementados.

## Datos del titular
- [ ] Nombre y apellido o razón social.
- [ ] Domicilio legal completo en Argentina.
- [ ] Emails reales y monitoreados: general, privacidad, denuncias/moderación y derechos de autor.
- [ ] Definir operación como persona humana o sociedad; evaluar exposición patrimonial, fiscal y contractual.
- [ ] Revisión por abogado matriculado en Argentina.

## Restricción 18+
- [ ] Hoy no hay verificación de edad ni barrera de acceso. Una autodeclaración no prueba mayoría de edad.
- [ ] Elegir un mecanismo proporcional de aseguramiento de edad antes de afirmar que el servicio excluye menores. Evitar recolectar DNI o biometría directamente sin evaluación legal y de seguridad.
- [ ] Definir si la escucha también se restringe: hoy cualquier visitante puede escuchar sin autenticación.
- [ ] Protocolo para detectar uso por menores y contenido que los involucre.

## Moderación y denuncias
- [ ] Crear email real de denuncias y asignar responsable y frecuencia de revisión.
- [ ] Implementar botón de reportar en cada post y respuesta, con referencia automática al contenido.
- [ ] Definir procedimiento por severidad, registro mínimo, apelación y preservación segura de evidencia.
- [ ] Protocolo para requerimientos judiciales y de autoridades.

## Eliminación y derechos
- [ ] Implementar localización y eliminación de post/reply y archivo del bucket, incluyendo referencias y copias según política.
- [ ] Resolver cómo identifica contenido propio alguien que no tiene cuenta ni username.
- [ ] Procedimiento para privacidad, intimidad, voz/imagen, copyright y contenido ilícito.
- [ ] Definir conservación, backups, logs y borrado.
- [ ] Procedimiento real para acceso, rectificación y supresión de datos personales.

## Seguridad y privacidad técnica
- [ ] Revisar RLS, privilegios y Storage; limitar tipo/tamaño y cargas abusivas.
- [ ] Evaluar bucket privado con URLs firmadas versus bucket público. Hoy voxurn-audio es público.
- [ ] Implementar límites de frecuencia y protección anti-spam.
- [ ] Revisar logs, accesos administrativos, secretos, backups, actualizaciones y respuesta a incidentes.
- [ ] Revisar proveedores, subencargados, ubicación y transferencias internacionales (Supabase, GitHub Pages, Google Fonts).
- [ ] Actualizar política antes de incorporar analítica, publicidad, cookies o SDK.
- [ ] Evaluar obligaciones AAIP y Ley 25.326.

## Derechos de contenido
- [ ] Prohibir amenazas, acoso, doxxing, material íntimo no consentido, explotación y abuso infantil, suplantación, fraude y violaciones de copyright.
- [ ] Procedimiento de reclamos de copyright.
- [ ] No prometer que se puede publicar música comercial por el solo hecho de grabarla.

## Lanzamiento
- [ ] Reemplazar todos los campos [ENTRE CORCHETES] en public/legal/index.html.
- [ ] Revisar enlaces legales en vistas desktop y móvil.
- [ ] Obtener revisión jurídica escrita y guardar versión/fecha aprobada.
- [ ] Probar denuncias, bajas, privacidad y seguridad de punta a punta.
- [ ] No anunciar “100% anónimo”, “eliminación inmediata” ni “solo adultos verificados” sin soporte real.

## Estado técnico observado en el repositorio al 15/11/2026
- Publicación y lectura anónima habilitadas por RLS para posts y replies.
- Bucket voxurn-audio público, límite 20 MB.
- No hay login, perfil público, denuncia ni eliminación desde la aplicación.
- Se puede escuchar sin iniciar sesión.
- No se verifica edad ni se solicita declaración 18+.
- Tema claro/oscuro guardado en localStorage; Google Fonts se carga desde proveedor externo.
- Supabase configurado en región São Paulo, Brasil.
