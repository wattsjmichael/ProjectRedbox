import type {
  WeaponItem,
} from '../items/ItemTypes'

export class InventorySystem {
  private items:
    WeaponItem[] = []

  private equippedItem:
    WeaponItem | null = null

  private readonly maxItems = 30

  addItem(
    item: WeaponItem
  ) {
    if (this.items.length >= this.maxItems) {
      return false
    }
    this.items.push(
      item
    )
    return true
  }

  getCapacity() {
    return this.maxItems
  }

  getItemCount() {
    return this.items.length
  }

  isFull() {
    return (
      this.items.length >=
      this.maxItems
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
  !alreadyOwned &&
  !this.isFull()
) {
  this.items.push(
    item
  )
}
  }

removeItem(
  id: string
) {
  if (
    this.equippedItem
      ?.id === id
  ) {
    return false
  }

  const index =
    this.items.findIndex(
      item =>
        item.id === id
    )

  if (
    index === -1
  ) {
    return false
  }

  this.items.splice(
    index,
    1
  )

  return true
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

  restore(
    items: WeaponItem[],
    equippedItem: WeaponItem | null
  ) {
    this.items =
      items
        .slice(0, this.maxItems)
        .map(
          item => ({ ...item })
        )

    this.equippedItem =
      equippedItem
        ? (
          this.items.find(
            item =>
              item.id ===
              equippedItem.id
          ) ?? null
        )
        : null
  }
}
