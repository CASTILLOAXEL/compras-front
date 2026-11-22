
const PATRON_ESTILO_VUETIFY = /^virtual:plugin-vuetify:([^?]+\.s[ac]ss)(\?.*)?$/

// Sass necesita rutas con "/" también en Windows
const normalizarRuta = (ruta: string) => ruta.replace(/\\/g, '/')

export const estilosVuetifyWindows = (rutaArchivoConfiguracion: string, rutaLibreriaVuetify: string) => {
  const archivoConfiguracion = normalizarRuta(rutaArchivoConfiguracion)
  const libreriaVuetify = normalizarRuta(rutaLibreriaVuetify)

  return {
    name: 'compras:estilos-vuetify-windows',
    enforce: 'pre' as const,

    load(id: string) {
      const coincidencia = PATRON_ESTILO_VUETIFY.exec(id)
      const archivoEstilo = coincidencia?.[1]

      if (!archivoEstilo)
        return null

      const rutaEstilo = normalizarRuta(archivoEstilo)

      // .scss lleva punto y coma; .sass (sintaxis con sangría) no
      const separador = rutaEstilo.endsWith('.scss') ? ';\n' : '\n'

      return `@use "${archivoConfiguracion}"${separador}@use "${libreriaVuetify}/${rutaEstilo}"${separador}`
    },
  }
}
