import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'medifind',
    themes: {
      medifind: {
        dark: false,
        colors: {
          primary: '#0F6E56',
          secondary: '#1D9E75',
          background: '#F4F1EA',
          surface: '#FFFFFF',
        },
      },
    },
  },
})