// Client wrapper for backend prediction API
// Uses Vite dev proxy to forward /api/predict -> http://localhost:5000/predict
export async function analyzeXray(file){
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/predict', { method:'POST', body: form })
  if(!res.ok) throw new Error(`Failed to analyze image (HTTP ${res.status})`)
  return await res.json()
}


