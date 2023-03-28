<template>
  <div>
    <p class="text-center text-danger">
      <fa-icon icon="times-circle" class="fa-5x"></fa-icon>
    </p>

    <p class="text-center">
      {{ message }}
    </p>

    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ErrorMessage',
  props: ['message'],
};
</script>
