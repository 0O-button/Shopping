import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLocationStore = defineStore('location', () => {
  const province = ref(localStorage.getItem('location_province') || '江苏')
  const city = ref(localStorage.getItem('location_city') || '南京')

  function setLocation(p, c) {
    province.value = p
    city.value = c
    localStorage.setItem('location_province', p)
    localStorage.setItem('location_city', c)
  }

  return { province, city, setLocation }
})