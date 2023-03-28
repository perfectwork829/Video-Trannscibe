<template>
  <div>
    <p class="text-center text-primary">
      <fa-icon icon="check-circle" class="fa-5x"></fa-icon>
    </p>

    <p class="text-center">
      {{ message }}
    </p>

    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'SuccessMessage',
  props: ['message'],
};
</script>
