<template>
  <div id="preloader">
    <div class="sk-three-bounce">
      <div class="sk-child sk-bounce1"></div>
      <div class="sk-child sk-bounce2"></div>
      <div class="sk-child sk-bounce3"></div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'PreLoader',
};
</script>
<style scoped lang="scss">
#preloader {
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  background-color: #000;
  z-index: 999999999;
}

.sk-three-bounce {
  display: flex;
  justify-content: center;
  margin: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  background-color: #000;
}

.sk-three-bounce .sk-child {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background-color: #5d78ff;
  border-radius: 100%;
  display: inline-block;
  -webkit-animation: sk-three-bounce 1.4s ease-in-out 0s infinite both;
  animation: sk-three-bounce 1.4s ease-in-out 0s infinite both;
}

.sk-three-bounce .sk-bounce1 {
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}

.sk-three-bounce .sk-bounce2 {
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}

@-webkit-keyframes sk-three-bounce {
  0%,
  80%,
  100% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  40% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}

@keyframes sk-three-bounce {
  0%,
  80%,
  100% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  40% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
</style>
