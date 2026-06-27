<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core"
import { DialogTitle, type DialogTitleProps, useForwardProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<DialogTitleProps & { class?: HTMLAttributes["class"] }>()

const forwarded = useForwardProps(reactiveOmit(props, "class"))
</script>

<template>
  <DialogTitle data-slot="dialog-title" v-bind="forwarded" :class="cn('text-lg font-semibold tracking-tight', props.class)">
    <slot />
  </DialogTitle>
</template>
