<template>
  <IconBase v-bind="$attrs" :clickable="clickable" @click="$emit('click', $event)">
    <path d="M558.933333 490.666667L384 665.6l59.733333 59.733333 234.666667-234.666666L443.733333 256 384 315.733333l174.933333 174.933334z" fill="#dbdbdb" />
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
