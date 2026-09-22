<script setup>
import { ref, computed } from 'vue'
import { useLocationStore } from '@/stores/location'
import { hotCities, cityGroups, findProvince } from '@/mock/city'
import { ElMessage } from 'element-plus'

const locationStore = useLocationStore()
const show = ref(false)
const locating = ref(false)
// 直辖市只显示一个名字
const displayCity = computed(() => {
  const municipalities = ['北京', '上海', '天津', '重庆']
  if (municipalities.includes(locationStore.city)) {
    return locationStore.city
  }
  return `${locationStore.province} ${locationStore.city}`
})
const activeTab = ref('hot') // hot | all

function open() {
  show.value = true
}

function pickCity(province, city) {
  locationStore.setLocation(province, city)
  show.value = false
  ElMessage.success(`已切换到 ${city}`)
}

// 自动定位：调用免费 IP 定位接口（无需 key）
// 说明：此为演示方案，正式项目建议用高德/百度地图 API 做逆地理编码
async function autoLocate() {
  locating.value = true
  try {
    const res = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined
    })
    const data = await res.json()
    const city = data.city
    const region = data.region
    if (city) {
      // 从返回的城市名反查省份，找不到就用 region
      const province = findProvince(city) || region || ''
      locationStore.setLocation(province, city)
      show.value = false
      ElMessage.success(`已定位到 ${city}`)
    } else {
      ElMessage.warning('未获取到城市信息，请手动选择')
    }
  } catch (e) {
    ElMessage.warning('自动定位失败，请手动选择城市')
  } finally {
    locating.value = false
  }
}
</script>

<template>
  <span class="location-picker" @click="open">
    <el-icon><Location /></el-icon>
   <span>{{ displayCity }}</span>

    <el-dialog
      v-model="show"
      title="选择收货地区"
      width="640px"
      append-to-body
    >
      <div class="picker-tabs">
        <span
          :class="['tab', { active: activeTab === 'hot' }]"
          @click="activeTab = 'hot'"
        >热门城市</span>
        <span
          :class="['tab', { active: activeTab === 'all' }]"
          @click="activeTab = 'all'"
        >按省份</span>
        <el-button
          class="locate-btn"
          size="small"
          type="danger"
          plain
          :loading="locating"
          @click="autoLocate"
        >
          <el-icon><Aim /></el-icon> 自动定位
        </el-button>
      </div>

      <div class="picker-body">
        <!-- 热门城市 -->
        <div v-if="activeTab === 'hot'" class="hot-cities">
          <span
            v-for="c in hotCities"
            :key="c.city"
            :class="['city-tag', { active: locationStore.city === c.city }]"
            @click="pickCity(c.province, c.city)"
          >{{ c.city }}</span>
        </div>

        <!-- 按省份 -->
        <div v-else class="group-cities">
          <div v-for="g in cityGroups" :key="g.province" class="group">
            <div class="group__title">{{ g.province }}</div>
            <div class="group__body">
              <span
                v-for="c in g.cities"
                :key="c"
                :class="['city-tag', { active: locationStore.city === c }]"
                @click="pickCity(g.province, c)"
              >{{ c }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </span>
</template>

<style scoped lang="scss">
.location-picker {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  color: inherit;

  &:hover { color: $primary-color; }
}

.picker-tabs {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-bottom: 8px;
  border-bottom: 1px solid $border-color;

  .tab {
    font-size: 14px;
    color: $text-normal;
    cursor: pointer;
    position: relative;
    padding-bottom: 8px;

    &.active {
      color: $primary-color;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        left: 0; right: 0; bottom: 0;
        height: 2px;
        background: $primary-color;
      }
    }
  }

  .locate-btn { margin-left: auto; }
}

.picker-body {
  padding-top: 16px;
  max-height: 380px;
  overflow-y: auto;
}

.hot-cities {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.group {
  margin-bottom: 18px;

  &__title {
    font-weight: 600;
    color: $text-color;
    margin-bottom: 10px;
    font-size: 14px;
  }

  &__body {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.city-tag {
  padding: 5px 14px;
  font-size: 13px;
  color: $text-normal;
  border: 1px solid $border-color;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { border-color: $primary-color; color: $primary-color; }

  &.active {
    border-color: $primary-color;
    color: $primary-color;
    background: #fff5f5;
    font-weight: 600;
  }
}
</style>