// src/api.js

import axios from 'axios'

// Récupère la structure complète du geographic context
export async function fetchGeographicContext () {
  const res = await axios.get('https://api-developers.spinalcom.com/api/v1/geographicContext/space')
  return res.data
}

// Récupère la liste des bâtiments
export async function fetchBuildings () {
  const data = await fetchGeographicContext()
  return data.children.filter(child => child.type === 'geographicBuilding')
}

// Récupère les étages d'un bâtiment (par nom)
export async function fetchFloors (buildingName) {
  const data = await fetchGeographicContext()
  const building = data.children.find(child => child.type === 'geographicBuilding' && child.name === buildingName)
  if (!building) return []
  return building.children.filter(child => child.type === 'geographicFloor')
}

// Récupère la liste des pièces d'un étage
export function getRooms (floor) {
  return floor.children.filter(child => child.type === 'geographicRoom')
}

// Récupère l'occupation réelle d'une pièce selon le modèle fourni
export async function fetchOccupation (dynamicId) {
  try {
    const res = await axios.get(`https://api-developers.spinalcom.com/api/v1/room/${dynamicId}/control_endpoint_list`)
    // Ici, la réponse est un tableau d'objets avec une clé "endpoints"
    const allEndpoints = []
    for (const profile of res.data) {
      if (profile.endpoints && Array.isArray(profile.endpoints)) {
        allEndpoints.push(...profile.endpoints)
      }
    }
    // Recherche du bon endpoint d'occupation
    const occupationEndpoint = allEndpoints.find(ep =>
      (ep.name && ep.name.toLowerCase().includes('occupation')) ||
      (ep.type && ep.type.toLowerCase().includes('occupation'))
    )
    if (occupationEndpoint && occupationEndpoint.currentValue !== undefined) {
      // Selon la valeur, retourne le bon statut
      if (occupationEndpoint.currentValue === true || occupationEndpoint.currentValue === 'true' || occupationEndpoint.currentValue === 1) return 'occupied'
      if (occupationEndpoint.currentValue === false || occupationEndpoint.currentValue === 'false' || occupationEndpoint.currentValue === 0) return 'free'
    }
    return 'undefined'
  } catch (e) {
    return 'undefined'
  }
}
