<template>
  <div class="main-container">
    <!-- Header -->
    <header>
      <img class="logo" src="@/assets/logo.png" alt="Logo" />
      <h1>Occupation des pièces du bâtiment</h1>
    </header>
    <!-- Filtres sur une ligne -->
    <div class="filters-row">
      <!-- Bâtiment à gauche -->
      <div class="filter-group">
        <label for="building-select">Bâtiment :</label>
        <select id="building-select" v-model="selectedBuilding">
          <option v-for="b in buildings" :key="b.dynamicId" :value="b.name">
            {{ b.name }}
          </option>
        </select>
      </div>
      <!-- Période au centre -->
      <div class="filter-group">
        <label>Période :</label>
        <input type="date" v-model="periodStart" />
        <span>au</span>
        <input type="date" v-model="periodEnd" />
      </div>
      <!-- Recherche à droite -->
      <div class="filter-group search-group">
        <input v-model="search" placeholder="Rechercher une pièce..." />
      </div>
    </div>
    <!-- Liste des étages -->
    <div class="etages-list">
      <div v-for="floor in filteredFloors" :key="floor.dynamicId" class="etage-block">
        <div class="etage-header" @click="toggleFloor(floor.dynamicId)">
          <h2>
            <span class="arrow" :class="{open: floor.open}">&#9654;</span>
            {{ floor.name }}
          </h2>
          <div class="etage-stats">
            <span class="stat occupied">
              <span class="dot occupied"></span> Occupées : {{ floor.stats.occupied }}
            </span>
            <span class="stat free">
              <span class="dot free"></span> Libres : {{ floor.stats.free }}
            </span>
            <span class="stat undefined">
              <span class="dot undefined"></span> Indéfinies : {{ floor.stats.undefined }}
            </span>
            <span class="stat percent">
              Taux d’occupation : <b>{{ floor.stats.percent }}%</b>
            </span>
          </div>
        </div>
        <transition name="fade">
          <div v-if="floor.open" class="etage-details">
            <div class="room-filters">
              <button
                v-for="stat in ['all','occupied','free','undefined']"
                :key="stat"
                :class="{active: floor.selectedStatus === stat}"
                @click.stop="setFloorStatusFilter(floor.dynamicId, stat)"
              >
                {{ statusLabel(stat) }}
              </button>
            </div>
            <ul class="rooms-list">
              <li
                v-for="room in filteredRooms(floor)"
                :key="room.dynamicId"
                :class="room.occupation"
              >
                <span class="dot" :class="room.occupation"></span>
                <span class="room-name">{{ room.name }}</span>
                <span class="room-status">
                  <template v-if="room.occupation === 'occupied'">Occupée</template>
                  <template v-else-if="room.occupation === 'free'">Libre</template>
                  <template v-else>Indéfini</template>
                </span>
                <span class="room-update">({{ room.lastUpdate || '...' }})</span>
              </li>
            </ul>
            <div class="etage-global">
              <b>Stat globale :</b>
              {{ floor.stats.occupied }} occupée(s),
              {{ floor.stats.free }} libre(s),
              {{ floor.stats.undefined }} indéfinie(s)
              — <b>{{ floor.stats.percent }}% d’occupation</b>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import {
  fetchBuildings,
  fetchFloors,
  getRooms,
  fetchOccupation
} from '@/api.js' // le service api

export default {
  name: 'OccupationEtages',
  data () {
    return {
      search: '',
      floors: [],
      buildings: [],
      selectedBuilding: '',
      periodStart: '',
      periodEnd: '',
      selectedRoom: null
    }
  },
  computed: {
    filteredFloors () {
      return this.floors.map(floor => {
        const filteredRooms = getRooms(floor).filter(room =>
          room.name.toLowerCase().includes(this.search.toLowerCase())
        )
        return {
          ...floor,
          filteredRooms,
          stats: this.getStats(filteredRooms)
        }
      }).filter(floor => floor.filteredRooms.length > 0)
    }
  },
  mounted () {
    this.loadBuildings()
  },
  methods: {
    async loadBuildings () {
      this.buildings = await fetchBuildings()
      if (this.buildings.length > 0) {
        this.selectedBuilding = this.buildings[0].name
        this.loadFloors()
      }
    },
    async loadFloors () {
      const floors = await fetchFloors(this.selectedBuilding)
      for (const floor of floors) {
        floor.open = false
        floor.selectedStatus = 'all'
        const rooms = getRooms(floor)
        for (const room of rooms) {
          room.occupation = await fetchOccupation(room.dynamicId)
          room.lastUpdate = new Date().toLocaleTimeString()
        }
      }
      this.floors = floors
    },
    getStats (rooms) {
      const total = rooms.length
      const occupied = rooms.filter(r => r.occupation === 'occupied').length
      const free = rooms.filter(r => r.occupation === 'free').length
      const undefinedc = rooms.filter(r => r.occupation === 'undefined').length
      const percent = total ? Math.round((occupied / total) * 100) : 0
      return { occupied, free, undefinedc, percent }
    },
    toggleFloor (id) {
      this.floors = this.floors.map(floor =>
        floor.dynamicId === id ? { ...floor, open: !floor.open } : { ...floor, open: false }
      )
    },
    setFloorStatusFilter (floorId, status) {
      this.floors = this.floors.map(floor =>
        floor.dynamicId === floorId ? { ...floor, selectedStatus: status } : floor
      )
    },
    filteredRooms (floor) {
      let rooms = floor.filteredRooms
      if (floor.selectedStatus && floor.selectedStatus !== 'all') {
        rooms = rooms.filter(room => room.occupation === floor.selectedStatus)
      }
      return rooms
    },
    statusLabel (stat) {
      if (stat === 'all') return 'Tous'
      if (stat === 'occupied') return 'Occupée'
      if (stat === 'free') return 'Libre'
      if (stat === 'undefined') return 'Indéfini'
      return stat
    }
  },
  watch: {
    selectedBuilding () {
      this.loadFloors()
    }
  }
}
</script>

<style scoped>

  header {
    display: flex;
    flex-direction: row;
    justify-content:  space-between;
    align-items: center;
    padding: 28px 0 12px 0;
    min-height: 60px;
  }
  .header-logo {
  flex: 0 0 auto;                /* Ne prend que la place du logo */
}
  .logo {
    height: 48px;
  }
  h1 {
    color: #010911;
    font-size: 2em;
    font-weight: 700;
    margin: 0;
    flex: 1 1 auto;                /* Prend tout l'espace restant */
    text-align: center;
  }

.filters-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  margin-bottom: 18px;
  margin-top: 10px;
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.filter-group label {
  font-weight: 500;
  color: #003366;
}
.filter-group select,
.filter-group input[type="date"] {
  padding: 7px 10px;
  border-radius: 6px;
  border: 1.5px solid #003366;
  font-size: 1em;
  background: #fff;
  color: #003366;
}
.search-group input {
  width: 220px;
  padding: 9px 14px;
  border-radius: 7px;
  border: 1.5px solid #003366;
  font-size: 1em;
}
@media (max-width: 900px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  .search-group input {
    width: 100%;
  }
}
/* --- Liste des étages centrée --- */
.etages-list {
  max-width: 950px;
  margin: 0 auto;
}

/* --- Bloc d'un étage (carte blanche avec ombre) --- */
.etage-block {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 28px;
  box-shadow: 0 2px 12px rgba(34,40,49,0.07);
  padding: 0;
  overflow: hidden;
}

/* --- Header d'un étage (cliquable, accordéon) --- */
.etage-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
  justify-content: space-between;
  border-bottom: 1px solid #f1f1f1;
  padding: 18px 26px 10px 26px;
  cursor: pointer;
  transition: background 0.15s;
}
.etage-header:hover {
  background: #f5f6fa;
}
.etage-header h2 {
  color: #003366;
  font-size: 1.2em;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* --- Flèche de l'accordéon étage --- */
.arrow {
  display: inline-block;
  transition: transform 0.2s;
  font-size: 1.1em;
}
.arrow.open {
  transform: rotate(90deg);
}

/* --- Statistiques de l'étage (occupées, libres, indéfinies, taux) --- */
.etage-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.stat {
  font-size: 1em;
  color: #003366;
}
.stat.percent {
  font-weight: bold;
  color: #27ae60;
}

/* --- Animation d'ouverture/fermeture de l'accordéon étage --- */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
  max-height: 0;
}

/* --- Détails de l'étage (liste des pièces, filtres) --- */
.etage-details {
  padding: 10px 26px 18px 26px;
  background: #f9fbfd;
}

/* --- Filtres par statut pour les pièces d'un étage --- */
.room-filters {
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
}
.room-filters button {
  padding: 7px 18px;
  border-radius: 6px;
  border: 1.5px solid #003366;
  background: #fff;
  color: #003366;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.room-filters button.active,
.room-filters button:hover {
  background: #003366;
  color: #fff;
}

/* --- Liste des pièces d'un étage --- */
.rooms-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.rooms-list li {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 10px 0;
  border-bottom: 1px solid #f6f6f6;
  font-size: 1.08em;
}
.rooms-list li:last-child {
  border-bottom: none;
}

/* --- Nom et statut de la pièce --- */
.room-name {
  font-weight: 500;
  color: #003366;
  min-width: 160px;
}
.room-status {
  font-weight: 400;
  min-width: 90px;
}
.room-update {
  color: #888;
  font-size: 0.95em;
}

/* --- Couleurs de statut pour chaque pièce --- */
li.occupied .room-status { color: #27ae60; }
li.free .room-status { color: #003366; }
li.undefined .room-status { color: #f1c40f; }

/* --- Pastille de couleur pour chaque statut --- */
.dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: middle;
}
.dot.occupied { background: #27ae60; }
.dot.free { background: #003366; }
.dot.undefined { background: #f1c40f; }

/* --- Stat globale de l'étage (en bas du détail étage) --- */
.etage-global {
  margin-top: 16px;
  font-size: 1.05em;
  color: #003366;
  background: #eef6fa;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 500;
}

</style>
