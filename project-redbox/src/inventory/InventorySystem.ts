import type {
  ArmorItem,
  InventoryItem,
  WeaponItem,
} from '../items/ItemTypes'

import {
  cloneInventoryItem,
  isArmorItem,
  isWeaponItem,
} from '../items/ItemTypes'

export class InventorySystem {
  private items: InventoryItem[] = []
  private equippedWeapon: WeaponItem | null = null
  private equippedArmor: ArmorItem | null = null
  private readonly maxItems = 30

  addItem(item: InventoryItem) {
    if (this.items.length >= this.maxItems || this.getItem(item.id)) return false
    this.items.push(cloneInventoryItem(item))
    return true
  }

  getCapacity() {
    return this.maxItems
  }

  getItemCount() {
    return this.items.length
  }

  isFull() {
    return this.items.length >= this.maxItems
  }

  getItems() {
    return this.items.map(cloneInventoryItem)
  }

  getItem(id: string) {
    return this.items.find(item => item.id === id) ?? null
  }

  equipItem(id: string) {
    return this.equipWeapon(id)
  }

  equipWeapon(id: string) {
    const item = this.getItem(id)
    if (!item || !isWeaponItem(item)) return null
    this.equippedWeapon = item
    return item
  }

  equipArmor(id: string) {
    const item = this.getItem(id)
    if (!item || !isArmorItem(item)) return null
    this.equippedArmor = item
    return item
  }

  setEquippedItem(item: WeaponItem) {
    return this.setEquippedWeapon(item)
  }

  setEquippedWeapon(item: WeaponItem) {
    const owned = this.ensureOwned(item)
    if (!owned || !isWeaponItem(owned)) return null
    this.equippedWeapon = owned
    return owned
  }

  setEquippedArmor(item: ArmorItem) {
    const owned = this.ensureOwned(item)
    if (!owned || !isArmorItem(owned)) return null
    this.equippedArmor = owned
    return owned
  }

  removeItem(id: string) {
    if (this.isEquipped(id)) return false
    const index = this.items.findIndex(item => item.id === id)
    if (index === -1) return false
    this.items.splice(index, 1)
    return true
  }

  getEquippedItem() {
    return this.equippedWeapon
  }

  getEquippedWeapon() {
    return this.equippedWeapon
  }

  getEquippedArmor() {
    return this.equippedArmor
  }

  isEquipped(id: string) {
    return this.isWeaponEquipped(id) || this.isArmorEquipped(id)
  }

  isWeaponEquipped(id: string) {
    return this.equippedWeapon?.id === id
  }

  isArmorEquipped(id: string) {
    return this.equippedArmor?.id === id
  }

  clear() {
    this.items = []
    this.equippedWeapon = null
    this.equippedArmor = null
  }

  restore(
    items: InventoryItem[],
    equippedWeapon: WeaponItem | null,
    equippedArmor: ArmorItem | null = null
  ) {
    this.items = items
      .slice(0, this.maxItems)
      .map(cloneInventoryItem)

    if (
      equippedArmor &&
      !this.items.some(item => item.id === equippedArmor.id)
    ) {
      this.items.push(cloneInventoryItem(equippedArmor))
    }

    const ownedWeapon = equippedWeapon
      ? this.items.find(item => item.id === equippedWeapon.id)
      : null
    const ownedArmor = equippedArmor
      ? this.items.find(item => item.id === equippedArmor.id)
      : null

    this.equippedWeapon = ownedWeapon && isWeaponItem(ownedWeapon)
      ? ownedWeapon
      : null
    this.equippedArmor = ownedArmor && isArmorItem(ownedArmor)
      ? ownedArmor
      : null
  }

  private ensureOwned(item: InventoryItem) {
    const existing = this.getItem(item.id)
    if (existing) return existing
    if (!this.addItem(item)) return null
    return this.getItem(item.id)
  }
}
