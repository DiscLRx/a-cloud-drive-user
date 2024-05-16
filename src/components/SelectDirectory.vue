<template>
  <a-layout>
    <hr>
    <a-layout-content style="background: #fff; margin: 0 1rem;">
      <a-breadcrumb style="margin: 0.5rem">
        <a-breadcrumb-item>
          <a-button style="margin: 0; padding: 0; height: min-content" type="text" @click="changeToRoot">
            我的文件
          </a-button>
        </a-breadcrumb-item>
        <a-breadcrumb-item v-for="(dir, index) in directoryPathArr">
          <a-button style="margin: 0; padding: 0; height: min-content" type="text"
                    v-if="index !== directoryPathArr.length - 1" @click="backToDirectory(index)">
            {{ dir.name }}
          </a-button>
          <template v-else>
            {{ dir.name }}
          </template>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </a-layout-content>
    <hr>
    <a-layout-content style="background: #fff; margin: 0 1rem;" class="browse-area">
      <a-table :columns="columns" :data-source="directoryItems" :pagination="false" :scroll="{y: tableHeight}">
        <template #bodyCell="{ column, record }">
          <div>
            <template v-if="column.key === 'name'">
              <span class="no-select">📁 </span>{{ record.name }}
            </template>
            <template v-else-if="column.key === 'action'">
              <span>
                <a @click="nextDirectory(record)">打开</a>
              </span>
            </template>
          </div>
        </template>
      </a-table>
    </a-layout-content>
  </a-layout>
</template>
<script setup>

import {ref} from "vue";
import arRequest from "../script/auto-refresh-request.js";

const tableHeight = 500

const {rootId} = defineProps(['rootId'])

const emit = defineEmits(['selectDir'])

const directoryPathArr = ref([])

const columns = [
  {
    title: '目录',
    dataIndex: 'name',
    key: 'name',
    width: '80%'
  },
  {
    title: '操作',
    key: 'action',
    width: '20%'
  },
];

const directoryItems = ref([])

changeToRoot()
emit('selectDir', rootId)

async function setDirectoryItems(parentId) {
  arRequest(`/api/file/items/${parentId}/children`, {
    method: 'GET'
  }).then(res => {
    if (res.code === 0) {
      directoryItems.value = res.data.filter(item => !item.isFile)
    } else {
      throw new Error()
    }
  })
}

function changeToRoot() {
  directoryPathArr.value = []
  setDirectoryItems(rootId)
  emit('selectDir', rootId)
}

function nextDirectory(dirItem) {
  directoryPathArr.value.push(dirItem)
  setDirectoryItems(dirItem.id)
  emit('selectDir', dirItem.id)
}

function backToDirectory(index) {
  const dirItem = directoryPathArr.value[index]
  directoryPathArr.value = directoryPathArr.value.slice(0, index + 1)
  setDirectoryItems(dirItem.id)
  emit('selectDir', dirItem.id)
}

</script>
<style scoped>

</style>