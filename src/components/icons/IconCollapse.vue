<template>
  <IconBase v-bind="$attrs" :clickable="clickable" @click="$emit('click', $event)">
    <path d="M602.496 512l338.752 338.752-90.496 90.496L421.504 512l429.248-429.248 90.496 90.496L602.496 512z m-320 0l338.752 338.752-90.496 90.496L101.504 512l429.248-429.248 90.496 90.496L282.496 512z" fill="#dbdbdb" />
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
