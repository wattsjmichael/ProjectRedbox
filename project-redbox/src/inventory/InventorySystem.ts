import type {
  WeaponItem,
} from '../items/ItemTypes'

export class InventorySystem {
  private items:
    WeaponItem[] = []

  private equippedItem:
    WeaponItem | null = null

  addItem(
    item: WeaponItem
  ) {
    this.items.push(
      item
    )
  }

  getItems() {
    return [
      ...this.items,
    ]
  }

  getItem(
    id: string
  ) {
    return (
      this.items.find(
        (
          item
        ) =>
          item.id === id
      ) ?? null
    )
  }

  equipItem(
    id: string
  ) {
    const item =
      this.getItem(
        id
      )

    if (
      !item
    ) {
      return null
    }

    this.equippedItem =
      item

    return item
  }

  setEquippedItem(
    item: WeaponItem
  ) {
    this.equippedItem =
      item

    const alreadyOwned =
      this.items.some(
        (
          existing
        ) =>
          existing.id ===
          item.id
      )

    if (
      !alreadyOwned
    ) {
      this.items.push(
        item
      )
    }
  }

  getEquippedItem() {
    return this.equippedItem
  }

  isEquipped(
    id: string
  ) {
    return (
      this.equippedItem
        ?.id === id
    )
  }

  clear() {
    this.items =
      []

    this.equippedItem =
      null
  }
}