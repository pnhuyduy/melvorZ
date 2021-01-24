window.MelvorZ = {}

const notify = (text, imgSrc, color = "success") => {
  return Toastify({
    text: `<div class="text-center">
        <img class="notification-img" src="${imgSrc}">
        <span class="badge badge-${color}">${text}</span>
      </div>`,
    duration: 2000,
    gravity: "top",
    position: "center",
    backgroundColor: "transparent",
    stopOnFocus: false,
  }).showToast()
}

const getHitPointsPercent = () => {
  let currentHP = combatData.player.hitpoints
  let maxHP = maxHitpoints
  return parseInt((currentHP / maxHP) * 100)
}

const hasFood = (params) => {
  if (!equippedFood[currentCombatFood] || equippedFood[currentCombatFood].qty == 0) {
    if (isDungeon && isInCombat && !equipmentSwapPurchased) {
      return false
    }
    let newFood = equippedFood.findIndex((food) => food && food.qty > 0)
    if (newFood < 0) {
      return false
    }
    selectEquippedFood(newFood)
  }
  return true
}

const isFindingNewEnemy = () => {
  return newEnemyLoading
}

const getEquippedFoodHealValue = () => {
  return getFoodHealValue(equippedFood[currentCombatFood].itemID)
}

const getLostHP = () => {
  let currentHP = combatData.player.hitpoints
  let maxHP = maxHitpoints
  return maxHP - currentHP
}

const getHitPoints = (monsterID) => {
  return MONSTERS[monsterID].hitpoints
}

const isMagicType = (monsterID) => {
  return MONSTERS[monsterID].attackType === CONSTANTS.attackType.Magic
}

const checkHitPointsRange = (hitPoints, min, max) => {
  return hitPoints < min || hitPoints > max
}

const addHitpointsContent = () => {
  const hitPointsLevel = getHitPoints(slayerTask[0].monsterID)
  if (!$("#hitPointsStat").length) {
    const content = `
      <div id="hitPointsStat">
        <br>
        <img class="skill-icon-xxs m-1" src="https://cdn.melvor.net/core/v018/assets/media/skills/combat/hitpoints.svg">
        <div class="d-inline" id="monsterHPLevel">${hitPointsLevel}</div>
      </div>
    `

    $("#combat-player-slayer-task").find(".mr-3").append(content)
  }
}
