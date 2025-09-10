<template>
  <IconBase v-bind="$attrs" :clickable="clickable" @click="$emit('click', $event)">
    <path d="M256 213.333333a85.333333 85.333333 0 1 0 170.666667 0 85.333333 85.333333 0 1 0-170.666667 0Z" fill="#dbdbdb" />
    <path d="M597.333333 213.333333a85.333333 85.333333 0 1 0 170.666667 0 85.333333 85.333333 0 1 0-170.666667 0Z" fill="#dbdbdb" />
    <path d="M256 512a85.333333 85.333333 0 1 0 170.666667 0 85.333333 85.333333 0 1 0-170.666667 0Z" fill="#dbdbdb" />
    <path d="M597.333333 512a85.333333 85.333333 0 1 0 170.666667 0 85.333333 85.333333 0 1 0-170.666667 0Z" fill="#dbdbdb" />
    <path d="M256 810.666667a85.333333 85.333333 0 1 0 170.666667 0 85.333333 85.333333 0 1 0-170.666667 0Z" fill="#dbdbdb" />
    <path d="M597.333333 810.666667a85.333333 85.333333 0 1 0 170.666667 0 85.333333 85.333333 0 1 0-170.666667 0Z" fill="#dbdbdb" />
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
