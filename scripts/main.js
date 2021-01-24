;(() => {
  const isChrome = navigator.userAgent.match("Chrome")
  const isFirefox = navigator.userAgent.match("Firefox")

  const getURL = (name) => (isChrome ? chrome : browser).runtime.getURL(name)

  const exists = (id) => document.contains(document.getElementById(id))

  const addScript = (name, scriptID, async = false) => {
    if (exists(document.getElementById(scriptID))) el.remove()

    const el = document.getElementById(scriptID)
    const script = document.createElement("script")

    script.src = getURL(name)
    script.setAttribute("id", scriptID)
    if (async) {
      script.setAttribute("async", true)
    }
    document.body.appendChild(script)
  }

  const addPlugin = async (name) => {
    addScript(`scripts/plugins/${name}.js`, `melvor-z-${name}`, true)
  }

  addScript("scripts/utils.js", "mevolr-z-utils")

  const plugins = ["combat"]
  plugins.forEach(addPlugin)
})()
