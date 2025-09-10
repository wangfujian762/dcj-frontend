<template>
  <IconBase v-bind="$attrs" :clickable="clickable" @click="$emit('click', $event)">
    <path d="M170.666667 128h597.333333l115.498667 115.498667a42.666667 42.666667 0 0 1 12.501333 30.165333V853.333333a42.666667 42.666667 0 0 1-42.666667 42.666667H170.666667a42.666667 42.666667 0 0 1-42.666667-42.666667V170.666667a42.666667 42.666667 0 0 1 42.666667-42.666667z m128 42.666667v213.333333h384V170.666667H298.666667z m-42.666667 341.333333v298.666667h512v-298.666667H256z m298.666667-298.666667h85.333333v128h-85.333333V213.333333z" fill="#dbdbdb" />
  </IconBase>
</template>

<script setup lang="ts">
interface Props {
  clickable?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  clickable: false
})

const emit = defineEmits<Emits>()
</script>
