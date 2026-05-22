import { render } from 'preact'
import { App } from './App'
import { setVscode } from './state'

import './styles/base.css'
import './styles/toolbar.css'
import './styles/tabs.css'
import './styles/components.css'
import './styles/waterfall.css'
import './styles/summaries.css'
import './styles/timeline.css'
import './styles/heatmap.css'
import './styles/errors.css'
import './styles/help.css'
import './styles/efficiency.css'
import './styles/insights.css'
import './styles/graph.css'

const vscode = window.acquireVsCodeApi()
setVscode(vscode)

render(<App />, document.getElementById('app')!)
