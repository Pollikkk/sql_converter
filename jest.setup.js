import { config } from '@vue/test-utils'
import { createApp } from 'vue'

// Вместо использования createApp напрямую, подключаем Vue
config.global.plugins = [createApp]