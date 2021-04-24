<template>
  <div id="app">
    	<keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>

  </div>
</template>

<script>
export default {
  name: 'App',
 
}

</script>

<style>
body{

  position:absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  margin: 0;
}
#app {
  height: 100%;
}

</style>
