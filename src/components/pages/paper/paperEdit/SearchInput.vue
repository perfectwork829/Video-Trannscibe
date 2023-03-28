<template>
  <div class="search-input-wrapper">
    <b-input-group>
      <template #prepend>
        <fa-icon :icon="['fas', 'search']" />
      </template>
      <input class="form-control" placeholder="Search" />
      <template #append>
        <fa-icon :icon="['fas', 'filter']" />
      </template>
    </b-input-group>
  </div>
</template>
<script>
export default {
  name: 'SearchInput',
};
</script>
<style lang="scss" scoped>
.search-input-wrapper {
  .input-group-prepend {
    width: 50px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    background-color: #5d78ff;
  }
  .input-group-append {
    width: 50px;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    background-color: #5d78ff;
  }
}
</style>
