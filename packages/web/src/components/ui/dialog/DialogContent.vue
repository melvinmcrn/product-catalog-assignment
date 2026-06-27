<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core"
import {
  DialogClose,
  DialogContent,
  type DialogContentEmits,
  type DialogContentProps,
  DialogOverlay,
  useForwardPropsEmits,
} from "reka-ui"
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<DialogContentProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, "class")
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <!-- Rendered inline (no DialogPortal) so it stays inside the component tree and is easy to test/reason about. -->
  <DialogOverlay
    data-slot="dialog-overlay"
    class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
  />
  <DialogContent
    data-slot="dialog-content"
    v-bind="forwarded"
    :class="cn(
      'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border p-6 shadow-lg duration-200',
      props.class,
    )"
  >
    <slot />
    <DialogClose
      class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
      aria-label="Close"
    >
      <span aria-hidden="true" class="text-lg leading-none">×</span>
    </DialogClose>
  </DialogContent>
</template>
