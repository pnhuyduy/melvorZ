;(() => {
  let autoList = ["autoEatWhileFindingEnemy", "autoFindDesireSlayerTask", "autoStackLoot", "autoEat"]
  class Combat {
    constructor() {
      this.imgSrc = "https://cdn.melvor.net/core/v018/assets/media/skills/combat/combat.svg"
      this.enable = autoList.reduce((acc, item) => {
        acc[item] = false
        return acc
      }, {})
      console.log(this.enable)
      this.init()
    }
    init() {
      autoList.forEach((el) => this[el](arguments))
      this.addHitPointsStat()
    }
    autoEatWhileFindingEnemy() {
      window.MelvorZ.autoEatWhileFindingEnemy = null
      const content = `
      <div class="col-12">
        <div class="custom-control custom-switch mb-1">
            <input type="checkbox" class="custom-control-input" id="enableAutoEatWhileFindingEnemy" name="enableAutoEatWhileFindingEnemy">
            <label class="custom-control-label" for="enableAutoEatWhileFindingEnemy">Auto eat when finding enemy</label>
        </div>
      </div>
      `
      const parentEl = $("#combat-play-eat-info").parent().closest(".row.no-gutters")
      parentEl.append(content)

      $("#enableAutoEatWhileFindingEnemy").on("click", () => {
        this.enable.autoEatWhileFindingEnemy = !this.enable.autoEatWhileFindingEnemy

        if (!this.enable.autoEatWhileFindingEnemy) {
          clearInterval(window.MelvorZ.autoEatWhileFindingEnemy)
          notify("Disabled auto eat while finding enenmy", this.imgSrc, "warning")
        } else {
          notify("Enabled auto eat while finding enenmy", this.imgSrc)
          window.MelvorZ.autoEatWhileFindingEnemy = setInterval(() => {
            if (isInCombat && isFindingNewEnemy()) {
              const lostHP = getLostHP()
              const foodValue = getEquippedFoodHealValue()
              const amountFoodToEat = Math.floor(lostHP / foodValue)
              for (let i = 0; i < amountFoodToEat; i++) {
                eatFood()
              }
            }

            return
          }, 1000)
        }
      })
    }

    autoFindDesireSlayerTask() {
      window.MelvorZ.autoFindDesireSlayerTask = null
      const tiers = [
        {
          name: "Easy",
          value: 0,
        },
        {
          name: "Normal",
          value: 1,
        },
        {
          name: "Hard",
          value: 2,
        },
        {
          name: "Elite",
          value: 3,
        },
        {
          name: "Master",
          value: 4,
        },
      ]

      let tierContent = ""
      tiers.forEach((tier) => {
        tierContent += `
          <div class="custom-control custom-radio custom-control-inline">
            <input type="radio" class="custom-control-input"
             id="${tier.name.toLowerCase()}-tier" 
             value="${tier.value}" 
             name="tier-slayer-task"
            >
            <label class="custom-control-label" for="${tier.name.toLowerCase()}-tier">${tier.name}</label>
          </div>
        `
      })

      const prevMinLevel = localStorage.getItem("MelvorZ.AutoSlayerTask.MinLevel") || 0
      const prevMaxLevel = localStorage.getItem("MelvorZ.AutoSlayerTask.MaxLevel") || 100

      const content = `
    <div class="col-12">
      <div class="form-group">
          <label class="d-block">HP level range</label>
          <div class="row mb-2">
              <div class="col-6">
                  <div class="input-group">
                      <div class="input-group-prepend">
                          <span class="input-group-text">
                              Min
                          </span>
                      </div>
                      <input type="number" class="form-control" id="slayerTaskMinHPLvl" name="slayerTaskMinHPLvl" value="${prevMinLevel}">
                  </div>
              </div>
              <div class="col-6">
                  <div class="input-group">
                      <div class="input-group-prepend">
                          <span class="input-group-text">
                              Max
                          </span>
                      </div>
                      <input type="number" class="form-control" id="slayerTaskMaxHPLvl" name="slayerTaskMaxHPLvl" value="${prevMaxLevel}">
                  </div>
              </div>
          </div>
          <div class="row">
              <div class="col-12">
                  <div class="form-group">
                      <label class="d-block">Tier</label>
                      ${tierContent}
                  </div>
              </div>
          </div>
          <button type="button" class="btn btn-primary" id="startFindingTask">Start</button>
      </div>
    </div>
      `

      const parentEl = $("#combat-slayer-task-container").find(".row.no-gutters")
      parentEl.append(content)
      const buttonToggle = $("#startFindingTask")

      // Input min max on change value
      $("#slayerTaskMinHPLvl").on("input", (e) => {
        localStorage.setItem("MelvorZ.AutoSlayerTask.MinLevel", e.target.value)
      })

      $("#slayerTaskMaxHPLvl").on("input", (e) => {
        localStorage.setItem("MelvorZ.AutoSlayerTask.MaxLevel", e.target.value)
      })

      const autoFindSlayerTask = () => {
        if (newEnemyLoading) return
        let tier = parseInt($("input[type=radio][name=tier-slayer-task]:checked").val())
        let minHPlevel = parseInt($("#slayerTaskMinHPLvl").val()) || 0
        let maxHPlevel = parseInt($("#slayerTaskMaxHPLvl").val()) || 100
        const currentEnemyID = combatData.enemy.id
        const currentEnemyHP = getHitPoints(currentEnemyID)
        let slayerTaskEnemyID, slayerTaskEnemyHP

        slayerTaskEnemyID = slayerTask[0].monsterID
        slayerTaskEnemyHP = getHitPoints(slayerTaskEnemyID)
        addHitpointsContent()
        if (isInCombat && currentEnemyID !== slayerTaskEnemyID) {
          jumpToEnemy(slayerTaskEnemyID)
        } else if (checkHitPointsRange(slayerTaskEnemyHP, minHPlevel, maxHPlevel)) {
          selectNewSlayerTask(tier)
        }
      }

      buttonToggle.on("click", () => {
        this.enable.autoFindDesireSlayerTask = !this.enable.autoFindDesireSlayerTask
        if (!this.enable.autoFindDesireSlayerTask) {
          buttonToggle.text("Start")
          buttonToggle.removeClass("btn-danger")
          buttonToggle.addClass("btn-primary")
          clearInterval(window.MelvorZ.autoFindDesireSlayerTask)
          notify("Disabled auto find slayer task", this.imgSrc, "warning")
        } else {
          buttonToggle.text("Stop")
          buttonToggle.removeClass("btn-primary")
          buttonToggle.addClass("btn-danger")
          notify("Enabled auto find slayer task", this.imgSrc)

          window.MelvorZ.autoFindDesireSlayerTask = setInterval(autoFindSlayerTask, 5000)
        }
      })
    }

    autoStackLoot() {
      window.MelvorZ.autoStackLoot = null
      const content = `
      <div class="col-12">
      <div class="custom-control custom-switch mb-1">
      <input type="checkbox" class="custom-control-input" id="autoStackLoot" name="autoStackLoot">
      <label class="custom-control-label" for="autoStackLoot">Auto stack loot</label>
      </div>
      </div>
      `
      const parentEl = $("#combat-loot").find("div.row.no-gutters")
      parentEl.prepend(content)

      $("#autoStackLoot").on("click", () => {
        this.enable.autoStackLoot = !this.enable.autoStackLoot
        if (!this.enable.autoStackLoot) {
          clearInterval(window.MelvorZ.autoStackLoot)
          notify("Disabled auto stack loot", this.imgSrc, "warning")
        } else {
          notify("Enabled auto stack loot", this.imgSrc)
          window.MelvorZ.autoStackLoot = setInterval(() => {
            if (droppedLoot.length) {
              let uniqueLoots = new Set(droppedLoot.map((el) => el.itemID))
              let stackLoots = droppedLoot.reduce((acc, item) => {
                if (!acc[item.itemID]) acc[item.itemID] = 0
                acc[item.itemID] += item.qty
                return acc
              }, {})

              let newDroppedLoot = [...uniqueLoots].map((el) => {
                return {
                  itemID: el,
                  qty: stackLoots[el],
                }
              })

              if (droppedLoot.length <= itemDropMax) {
                droppedLoot = [...newDroppedLoot]
                loadLoot()
              }
            }
          }, 10000)
        }
      })
    }

    addHitPointsStat() {
      window.MelvorZ.addHitPointsStat = setInterval(() => {
        if (slayerTask[0]) {
          addHitpointsContent()
          clearInterval(window.MelvorZ.addHitPointsStat)
        }
      }, 100)
    }

    autoEat() {
      window.MelvorZ.autoEat = null
      const prevPercent = localStorage.getItem("MelvorZ.AutoEat") || 80
      const content = `
      <div class="col-12">
      <div class="custom-control custom-switch mb-1">
          <input type="checkbox" class="custom-control-input" id="enableAutoEat" name="enableAutoEat">
          <label class="custom-control-label" for="enableAutoEat">Auto eat by HP percent</label>
      </div>
        <div class="form-group">
          <div id="inputPercent" class="row" style="display: none">
            <div class="col-6 offset-3">
              <div class="input-group">
                <input type="number" class="form-control" id="hitPointsPercent" name="percent" value="${prevPercent}">
                <div class="input-group-append">
                    <span class="input-group-text">
                        %
                    </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      `

      const parentEl = $("#combat-play-eat-info").parent().closest(".row.no-gutters")
      parentEl.append(content)

      $("#hitPointsPercent").on("input", (e) => localStorage.setItem("MelvorZ.AutoEat", e.target.value))

      const run = () => {
        let percent = parseInt($("#hitPointsPercent").val())
        let currentPercent = getHitPointsPercent()
        while (currentPercent <= percent) {
          if (hasFood()) {
            eatFood()
            currentPercent = getHitPointsPercent()
          } else {
            stopCombat(false, true, true)
            mineRock(7, true)
            return
          }
        }

        window.MelvorZ.autoEat = setTimeout(run, 100)
      }

      $("#enableAutoEat").on("click", () => {
        this.enable.autoEat = !this.enable.autoEat
        if (!this.enable.autoEat) {
          clearTimeout(window.MelvorZ.autoEat)
          $("#inputPercent").hide()
          notify("Disabled auto eat", this.imgSrc, "warning")
        } else {
          $("#inputPercent").show()
          notify("Enabled auto eat", this.imgSrc)
          window.MelvorZ.autoEat = setTimeout(run, 100)
        }
      })
    }
  }

  new Combat()
})()
