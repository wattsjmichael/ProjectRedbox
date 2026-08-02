import Phaser from 'phaser'

import {
  PersistenceSystem,
} from '../persistence/PersistenceSystem'

import type {
  HunterProfileSummary,
} from '../persistence/PersistenceSystem'

type ProfileModal =
  | 'create'
  | 'delete'
  | 'reset'
  | null

export class HunterProfileScene extends Phaser.Scene {
  private readonly persistence = new PersistenceSystem()
  private profiles: HunterProfileSummary[] = []
  private selectedId: string | null = null
  private modal: ProfileModal = null
  private hunterName = ''
  private statusMessage = ''
  private page = 0
  private readonly profilesPerPage = 4

  constructor() {
    super('HunterProfileScene')
  }

  create() {
    this.input.setDefaultCursor('default')
    this.profiles = this.persistence.initializeProfiles()
    const activeId = this.persistence.getActiveProfileId()
    this.selectedId =
      this.profiles.find(profile => profile.id === activeId)?.id ??
      this.profiles[0]?.id ?? null
    this.render()
    this.input.keyboard?.on('keydown', this.handleKeyDown, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.handleKeyDown, this)
    })
  }

  private render() {
    this.children.removeAll(true)
    this.cameras.main.setBackgroundColor('#05070a')
    this.add.rectangle(640, 360, 1280, 720, 0x05070a)
    this.add.rectangle(640, 70, 1280, 140, 0x111720)
    this.add.rectangle(25, 70, 8, 140, 0xe50914)

    this.add.text(72, 35, 'PROJECT REDBOX', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '32px',
      color: '#e50914',
    })
    this.add.text(74, 80, 'HUNTER PROFILE TERMINAL', {
      fontFamily: 'Courier New, monospace',
      fontSize: '15px',
      color: '#8ba0ae',
    })

    this.createProfileList()
    this.createSelectedDetails()
    this.createFooter()

    if (this.modal) this.createModal()
  }

  private createProfileList() {
    const totalPages = Math.max(1, Math.ceil(this.profiles.length / this.profilesPerPage))
    this.page = Phaser.Math.Clamp(this.page, 0, totalPages - 1)
    const visible = this.profiles.slice(
      this.page * this.profilesPerPage,
      this.page * this.profilesPerPage + this.profilesPerPage
    )

    this.add.text(72, 145, 'LOCAL HUNTERS', {
      fontFamily: 'Arial Black, Arial', fontSize: '18px', color: '#ffffff',
    })

    if (visible.length === 0) {
      this.add.rectangle(335, 350, 525, 310, 0x0d1218, 0.95)
        .setStrokeStyle(2, 0x303b45)
      this.add.text(335, 320, 'NO HUNTERS FOUND', {
        fontFamily: 'Arial Black, Arial', fontSize: '25px', color: '#8b949d',
      }).setOrigin(0.5)
      this.add.text(335, 365, 'Create a Hunter to begin.', {
        fontFamily: 'Arial', fontSize: '17px', color: '#66727c',
      }).setOrigin(0.5)
      return
    }

    visible.forEach((profile, index) => {
      const y = 215 + index * 100
      const selected = profile.id === this.selectedId
      const active = profile.id === this.persistence.getActiveProfileId()
      const card = this.add.rectangle(
        335, y, 525, 82,
        selected ? 0x172733 : 0x0d1218,
        0.98
      )
        .setStrokeStyle(2, profile.unavailable ? 0x7d252d : selected ? 0x55d8ee : 0x303b45)
        .setInteractive({ useHandCursor: true })
      card.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.button !== 0 || this.modal) return
        this.selectedId = profile.id
        this.statusMessage = ''
        this.render()
      })

      this.add.text(92, y - 24, profile.name.toUpperCase(), {
        fontFamily: 'Arial Black, Arial', fontSize: '20px',
        color: profile.unavailable ? '#ff5a62' : '#ffffff',
      })
      this.add.text(92, y + 8,
        profile.unavailable
          ? 'PROFILE DATA UNAVAILABLE'
          : `LEVEL ${profile.hunterLevel}   //   CORE LV ${profile.coreLevel}   //   DROPS ${profile.completedDrops}`,
        { fontFamily: 'Courier New, monospace', fontSize: '13px', color: '#8b99a4' }
      )
      if (active) {
        this.add.text(555, y - 24, 'ACTIVE', {
          fontFamily: 'Arial Black, Arial', fontSize: '11px', color: '#55d8ee',
        }).setOrigin(1, 0)
      }
    })

    if (totalPages > 1) {
      this.createButton(78, 607, 120, 'PREV', 0x202731, () => {
        this.page = Math.max(0, this.page - 1)
        this.render()
      }, this.page === 0)
      this.add.text(335, 625, `PAGE ${this.page + 1} / ${totalPages}`, {
        fontFamily: 'Courier New, monospace', fontSize: '13px', color: '#71808a',
      }).setOrigin(0.5)
      this.createButton(472, 607, 120, 'NEXT', 0x202731, () => {
        this.page = Math.min(totalPages - 1, this.page + 1)
        this.render()
      }, this.page === totalPages - 1)
    }
  }

  private createSelectedDetails() {
    const profile = this.getSelected()
    this.add.rectangle(930, 365, 560, 440, 0x0a0e13, 0.98)
      .setStrokeStyle(2, 0x303b45)
    this.add.text(680, 165, 'HUNTER RECORD', {
      fontFamily: 'Arial Black, Arial', fontSize: '18px', color: '#e50914',
    })

    if (!profile) {
      this.add.text(930, 350, 'SELECT OR CREATE A HUNTER', {
        fontFamily: 'Arial Black, Arial', fontSize: '19px', color: '#5d6871',
      }).setOrigin(0.5)
      return
    }

    const lastPlayed = new Date(profile.updatedAt).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    })
    this.add.text(680, 210, profile.name.toUpperCase(), {
      fontFamily: 'Arial Black, Arial', fontSize: '31px',
      color: profile.unavailable ? '#ff5a62' : '#ffffff',
    })
    this.add.text(680, 270, [
      `HUNTER LEVEL     ${profile.hunterLevel}`,
      `WEAPON           ${profile.equippedWeaponName}`,
      `ARMOR            ${profile.equippedArmorName}`,
      `CORE             LV ${profile.coreLevel} // ${profile.coreStage.toUpperCase()}`,
      `COMPLETED DROPS  ${profile.completedDrops}`,
      `LAST PLAYED      ${lastPlayed}`,
    ].join('\n\n'), {
      fontFamily: 'Courier New, monospace', fontSize: '15px', color: '#b7c0c7',
      wordWrap: { width: 475 },
    })

    if (profile.unavailable) {
      this.add.text(680, 535, 'This profile cannot be loaded. It has not been overwritten.', {
        fontFamily: 'Arial', fontSize: '14px', color: '#ff7078', wordWrap: { width: 470 },
      })
    }
  }

  private createFooter() {
    const selected = this.getSelected()
    this.createButton(72, 660, 230, 'CREATE NEW HUNTER', 0x274957, () => {
      this.modal = 'create'
      this.hunterName = ''
      this.statusMessage = ''
      this.render()
    })
    this.createButton(330, 660, 230, 'CONTINUE HUNTER', 0xe50914, () => this.continueHunter(), !selected || selected.unavailable)
    this.createButton(680, 660, 170, 'RESET HUNTER', 0x4b3420, () => {
      this.modal = 'reset'
      this.render()
    }, !selected || selected.id !== this.persistence.getActiveProfileId() || selected.unavailable)
    this.createButton(875, 660, 170, 'DELETE PROFILE', 0x57171d, () => {
      this.modal = 'delete'
      this.render()
    }, !selected)
    this.createButton(1070, 660, 140, 'BACK', 0x202731, () => this.scene.start('TitleScene'))

    if (this.statusMessage) {
      this.add.text(640, 610, this.statusMessage, {
        fontFamily: 'Arial Black, Arial', fontSize: '13px', color: '#ffcc66',
      }).setOrigin(0.5)
    }
  }

  private createModal() {
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.72)
      .setInteractive().setDepth(100)
    const panel = this.add.rectangle(640, 360, 650, 310, 0x10161d, 1)
      .setStrokeStyle(3, this.modal === 'delete' ? 0xe50914 : 0x55b8cc)
      .setDepth(101)

    if (this.modal === 'create') {
      this.add.text(640, 255, 'CREATE HUNTER', {
        fontFamily: 'Arial Black, Arial', fontSize: '28px', color: '#ffffff',
      }).setOrigin(0.5).setDepth(102)
      this.add.rectangle(640, 350, 500, 58, 0x05080b, 1)
        .setStrokeStyle(2, 0x55b8cc).setDepth(102)
      this.add.text(640, 350, this.hunterName || 'ENTER HUNTER NAME', {
        fontFamily: 'Courier New, monospace', fontSize: '22px',
        color: this.hunterName ? '#ffffff' : '#53616b',
      }).setOrigin(0.5).setDepth(103)
      this.add.text(640, 397, `${this.hunterName.length} / 16`, {
        fontFamily: 'Courier New, monospace', fontSize: '12px', color: '#72818b',
      }).setOrigin(0.5).setDepth(103)
      if (this.statusMessage) {
        this.add.text(640, 420, this.statusMessage, {
          fontFamily: 'Arial Black, Arial', fontSize: '11px', color: '#ff7078',
        }).setOrigin(0.5).setDepth(103)
      }
      this.createButton(465, 455, 250, 'CANCEL', 0x202731, () => this.closeModal(), false, 102)
      this.createButton(815, 455, 250, 'CREATE HUNTER', 0xe50914, () => this.submitCreate(), !this.persistence.normalizeHunterName(this.hunterName), 102)
    } else {
      const profile = this.getSelected()
      const deleting = this.modal === 'delete'
      this.add.text(640, 265, deleting ? `DELETE HUNTER "${profile?.name ?? ''}"?` : `RESET HUNTER "${profile?.name ?? ''}"?`, {
        fontFamily: 'Arial Black, Arial', fontSize: '25px', color: deleting ? '#ff5962' : '#ffbd66',
      }).setOrigin(0.5).setDepth(102)
      this.add.text(640, 345,
        deleting
          ? 'This permanently removes this Hunter\'s local progress.\nOther Hunters are not affected.'
          : 'Inventory, equipment, Core, tutorial, and progression return to a fresh state.\nThe profile name and identity remain.',
        { fontFamily: 'Arial', fontSize: '16px', color: '#c2c8cd', align: 'center', lineSpacing: 8 }
      ).setOrigin(0.5).setDepth(102)
      this.createButton(465, 445, 250, 'CANCEL', 0x202731, () => this.closeModal(), false, 102)
      this.createButton(815, 445, 250, deleting ? 'DELETE HUNTER' : 'RESET HUNTER', deleting ? 0x8a1018 : 0x6b401d, () => deleting ? this.confirmDelete() : this.confirmReset(), false, 102)
    }

    panel.setInteractive()
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    label: string,
    color: number,
    action: () => void,
    disabled = false,
    depth = 1
  ) {
    const button = this.add.rectangle(x + width / 2, y, width, 46, disabled ? 0x1a1d20 : color)
      .setStrokeStyle(2, disabled ? 0x34383b : 0xb7c5cc)
      .setDepth(depth)
    const text = this.add.text(x + width / 2, y, label, {
      fontFamily: 'Arial Black, Arial', fontSize: '13px', color: disabled ? '#555b60' : '#ffffff',
    }).setOrigin(0.5).setDepth(depth + 1)

    if (!disabled) {
      button.setInteractive({ useHandCursor: true })
      button.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.button === 0) action()
      })
      button.on('pointerover', () => button.setAlpha(0.78))
      button.on('pointerout', () => button.setAlpha(1))
      text.setInteractive({ useHandCursor: true })
      text.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.button === 0) action()
      })
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.modal === 'create') {
      if (event.key === 'Escape') return this.closeModal()
      if (event.key === 'Enter') return this.submitCreate()
      if (event.key === 'Backspace') {
        this.hunterName = this.hunterName.slice(0, -1)
        return this.render()
      }
      if (event.key.length === 1 && /^[A-Za-z0-9 '\-]$/.test(event.key) && this.hunterName.length < 16) {
        this.hunterName += event.key
        this.render()
      }
      return
    }

    if (this.modal) {
      if (event.key === 'Escape') this.closeModal()
      return
    }

    if (event.key === 'Escape') this.scene.start('TitleScene')
    if (event.key === 'Enter') this.continueHunter()
    if (event.key === 'ArrowLeft' && this.page > 0) { this.page--; this.render() }
    if (event.key === 'ArrowRight' && (this.page + 1) * this.profilesPerPage < this.profiles.length) { this.page++; this.render() }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') this.moveSelection(event.key === 'ArrowDown' ? 1 : -1)
  }

  private moveSelection(direction: number) {
    if (this.profiles.length === 0) return
    const current = Math.max(0, this.profiles.findIndex(profile => profile.id === this.selectedId))
    const next = Phaser.Math.Clamp(current + direction, 0, this.profiles.length - 1)
    this.selectedId = this.profiles[next].id
    this.page = Math.floor(next / this.profilesPerPage)
    this.render()
  }

  private submitCreate() {
    const normalized = this.persistence.normalizeHunterName(this.hunterName)
    if (!normalized) {
      this.statusMessage = 'USE 1–16 LETTERS, NUMBERS, SPACES, HYPHENS, OR APOSTROPHES'
      return this.render()
    }
    const created = this.persistence.createProfile(normalized)
    if (!created) {
      this.statusMessage = 'HUNTER CREATION FAILED // LOCAL STORAGE UNAVAILABLE'
      return this.render()
    }
    this.scene.start('HunterBayScene')
  }

  private continueHunter() {
    const profile = this.getSelected()
    if (!profile || profile.unavailable) return
    if (!this.persistence.setActiveProfile(profile.id)) {
      this.statusMessage = 'HUNTER PROFILE COULD NOT BE ACTIVATED'
      return this.render()
    }
    this.scene.start('HunterBayScene')
  }

  private confirmDelete() {
    if (!this.selectedId || !this.persistence.deleteProfile(this.selectedId)) {
      this.statusMessage = 'PROFILE DELETE FAILED'
    }
    this.modal = null
    this.profiles = this.persistence.listProfiles()
    this.selectedId = this.profiles[0]?.id ?? null
    this.render()
  }

  private confirmReset() {
    if (!this.selectedId || !this.persistence.resetProfile(this.selectedId)) {
      this.statusMessage = 'HUNTER RESET FAILED'
    } else {
      this.statusMessage = 'ACTIVE HUNTER RESET'
    }
    this.modal = null
    this.profiles = this.persistence.listProfiles()
    this.render()
  }

  private closeModal() {
    this.modal = null
    this.statusMessage = ''
    this.render()
  }

  private getSelected() {
    return this.profiles.find(profile => profile.id === this.selectedId) ?? null
  }
}
