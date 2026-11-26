import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { BrandingPreview } from './branding/BrandingPreview'
import './styles.css'

const brandingVariant = new URLSearchParams(window.location.search).get('branding')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {brandingVariant === 'favicon' ? <BrandingPreview variant="favicon" /> : brandingVariant === 'logo' ? <BrandingPreview variant="logo" /> : <App />}
  </StrictMode>,
)
