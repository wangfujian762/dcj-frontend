<template>
  <IconBase v-bind="$attrs" :clickable="clickable" @click="$emit('click', $event)">
    <path d="M741.504 512L402.752 173.248l90.496-90.496L922.496 512l-429.248 429.248-90.496-90.496L741.504 512z m-320 0L82.752 173.248l90.496-90.496L602.496 512l-429.248 429.248-90.496-90.496L421.504 512z" fill="#dbdbdb" />
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
