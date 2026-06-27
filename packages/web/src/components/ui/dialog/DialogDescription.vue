<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core"
import { DialogDescription, type DialogDescriptionProps, useForwardProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<DialogDescriptionProps & { class?: HTMLAttributes["class"] }>()

const forwarded = useForwardProps(reactiveOmit(props, "class"))
</script>

<template>
  <DialogDescription data-slot="dialog-description" v-bind="forwarded" :class="cn('text-muted-foreground text-sm', props.class)">
    <slot />
  </DialogDescription>
</template>
