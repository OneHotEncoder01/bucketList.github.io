// Inject the Tailwind CDN so we can use utility classes without a build step.
// Aligns with the React Flow Tailwind styling example.
if (typeof window !== 'undefined' && !window.__FOCUSFRAME_TAILWIND__) {
  const configScript = document.createElement('script')
  configScript.type = 'text/javascript'
  configScript.text = `
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            focusframe: '#0f172a',
            flowaccent: '#14b8a6',
          },
        },
      },
    };
  `

  const tailwindScript = document.createElement('script')
  tailwindScript.type = 'text/javascript'
  tailwindScript.src = 'https://cdn.tailwindcss.com'
  tailwindScript.defer = true

  document.head.appendChild(configScript)
  document.head.appendChild(tailwindScript)

  window.__FOCUSFRAME_TAILWIND__ = true
}
