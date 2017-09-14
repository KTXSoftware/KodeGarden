import Server from './Server';
import Syntax from './Syntax';

declare var require: any;
declare var monaco: any;
declare var WorkerKha: any;

require(['domReady', 'vs/editor/editor.main'], (domReady) => {
	domReady(async () => {
		let currentFile = '';
		let sha = '49cf90fc43fcd8944fe46afcf213d2235cf60dbb';
		if (window.location.hash.length > 1) {
			sha = window.location.hash.substr(1);
		}

		window.onhashchange = () => {
			let newsha = window.location.hash.substr(1);
			if (newsha !== sha) {
				location.reload();
			}
		};

		WorkerKha.instance.load('/projects/' + sha + '/khaworker.js');

		monaco.languages.register({ id: 'haxe' });
		monaco.languages.setMonarchTokensProvider('haxe', Syntax);
		let editordiv = document.getElementById('texteditor');
		let editor = monaco.editor.create(editordiv, {
			value: '',
			language: 'haxe',
			theme: 'vs-dark'
		});

		window.onresize = () => {
			editor.layout({ width: window.innerWidth / 2, height: editordiv.clientHeight });
		};

		await Server.start();

		function addSource(source: string) {
			let sourcesElement = document.getElementById('sources');
			let tr = document.createElement('tr');
			tr.onclick = async () => {
				currentFile = source;
				editor.setValue(await Server.source(sha, source));
			};
			tr.style.cursor = 'pointer';
			let td1 = document.createElement('td');
			td1.innerText = source;
			let td2 = document.createElement('td');
			td2.setAttribute('align', 'right');
			let button = document.createElement('button');
			button.innerText = 'x';
			button.onclick = () => {

			};
			td2.appendChild(button);
			tr.appendChild(td1);
			tr.appendChild(td2);
			sourcesElement.appendChild(tr);
		}
		
		let sources = await Server.sources(sha);
		for (let source of sources) {
			addSource(source);
		}

		function addAsset(source: string) {
			let assetsElement = document.getElementById('assets');
			let tr = document.createElement('tr');
			tr.onclick = async () => {

			};
			tr.style.cursor = 'pointer';
			let td1 = document.createElement('td');
			td1.innerText = source;
			let td2 = document.createElement('td');
			td2.setAttribute('align', 'right');
			let button = document.createElement('button');
			button.innerText = 'x';
			button.onclick = () => {

			};
			td2.appendChild(button);
			tr.appendChild(td1);
			tr.appendChild(td2);
			assetsElement.appendChild(tr);
		}

		let assets = await Server.assets(sha);
		for (let asset of assets) {
			addAsset(asset);
		}

		let addAssetButton = document.getElementById('uploadasset') as HTMLInputElement;
		addAssetButton.onchange = (event) => {
			const reader = new FileReader();
			const file = (event.currentTarget as any).files[0];

			reader.onload = async (upload: any) => {
				let buffer: ArrayBuffer = upload.target.result;
				sha = await Server.addAsset(sha, file.name, buffer);
				WorkerKha.instance.load('/projects/' + sha + '/khaworker.js');	
				addAsset(file.name);
				window.history.pushState('', '', '#' + sha);
			};

			reader.readAsArrayBuffer(file);
		};

		function addShader(shader: string) {
			let shadersElement = document.getElementById('shaders');
			let tr = document.createElement('tr');
			tr.onclick = async () => {
				currentFile = shader;
				editor.setValue(await Server.shader(sha, shader));
			};
			tr.style.cursor = 'pointer';
			let td1 = document.createElement('td');
			td1.innerText = shader;
			let td2 = document.createElement('td');
			td2.setAttribute('align', 'right');
			let button = document.createElement('button');
			button.innerText = 'x';
			button.onclick = () => {

			};
			td2.appendChild(button);
			tr.appendChild(td1);
			tr.appendChild(td2);
			shadersElement.appendChild(tr);
		}

		let shaders = await Server.shaders(sha);
		for (let shader of shaders) {
			addShader(shader);
		}

		let addShaderButton = document.getElementById('addshader') as HTMLButtonElement;
		addShaderButton.onclick = async () => {
			let nameElement = document.getElementById('addshadername') as HTMLInputElement;
			let name = nameElement.value.trim();
			if (!name.endsWith('.frag.glsl') && !name.endsWith('.vert.glsl')) {
				alert('Shader name has to end with .frag.glsl or .vert.glsl')
				return;
			}
			if (name.length < 44) {
				sha = await Server.addShader(sha, name);
				WorkerKha.instance.load('/projects/' + sha + '/khaworker.js');
				nameElement.value = '';
				addShader(name);
				window.history.pushState('', '', '#' + sha);
			}
			else {
				alert('Use a shorter name.');
			}
		};

		let addSourceButton = document.getElementById('addsource') as HTMLButtonElement;
		addSourceButton.onclick = async () => {
			let nameElement = document.getElementById('addsourcename') as HTMLInputElement;
			let name = nameElement.value.trim();
			if (!name.endsWith('.hx')) {
				name += '.hx';
			}
			if (name.length < 44) {
				sha = await Server.addSource(sha, name);
				WorkerKha.instance.load('/projects/' + sha + '/khaworker.js');				
				nameElement.value = '';
				addSource(name);
				window.history.pushState('', '', '#' + sha);
			}
			else {
				alert('Use a shorter name.');
			}
		};

		let injectButton = document.getElementById('compileinject') as HTMLButtonElement;
		injectButton.onclick = async () => {
			if (currentFile.endsWith('.hx')) {
				sha = await Server.setSource(sha, currentFile, editor.getValue());
			}
			WorkerKha.instance.inject('/projects/' + sha + '/khaworker.js');
			window.history.pushState('', '', '#' + sha);
		};

		let button = document.getElementById('compilereload') as HTMLButtonElement;
		button.onclick = async () => {
			if (currentFile.endsWith('.hx')) {
				sha = await Server.setSource(sha, currentFile, editor.getValue());
			}
			else {
				sha = await Server.setShader(sha, currentFile, editor.getValue());
			}
			WorkerKha.instance.load('/projects/' + sha + '/khaworker.js');
			window.history.pushState('', '', '#' + sha);
		};

		let downloadButton = document.getElementById('download') as HTMLButtonElement;
		downloadButton.onclick = async () => {
			await Server.download(sha);
			window.location.replace('/archives/' + sha + '.zip');
		};

		/*let connection = new WebSocket('ws://' + window.location.host + '/');
		connection.onopen = () => {
			document.getElementById('compile').onclick = () => {
				document.getElementById('compilemessage').textContent = ' Compiling...';
				let console = document.getElementById('console');
				while (console.firstChild) {
					console.removeChild(console.firstChild);
				}
				connection.send(JSON.stringify({ method: 'compile', data: { source: editor.getValue() } }));
			};
			//connection.send(JSON.stringify({ method: 'getSource', data: { sha: sha } }));
			connection.send(JSON.stringify({ method: 'sources', id: sha }));
		};

		connection.onerror = (error) => {
			console.error('Could not connect to socket. ' + error);
		};*/

		function addConsoleMessage(message, error) {
			let console = document.getElementById('console');
			let messages = message.trim().split('\n');
			for (let message of messages) {
				let span = document.createElement('span');
				span.textContent = message;
				if (error) span.style.color = '#cc1111';
				console.appendChild(span);
				console.appendChild(document.createElement('br'));
			}
		}

		/*connection.onmessage = (e) => {
			let message = JSON.parse(e.data);
			switch (message.method) {
				case 'compiled':
					document.getElementById('compilemessage').textContent = ' Compiled.';
					console.log('Reloading Kha.');
					(document.getElementById('application') as HTMLIFrameElement).contentWindow.location.replace('/projects/' + message.data.sha + '/');
					window.location.hash = '#' + message.data.sha;
					break;
				case 'errored':
					document.getElementById('compilemessage').textContent = ' Errored.';
					break;
				case 'source':
					editor.setValue(message.data.source);
					break;
				case 'compilation-message':
					addConsoleMessage(message.data.message, false);
					break;
				case 'compilation-error':
					addConsoleMessage(message.data.message, true);
					break;
			}
		};*/
	});
});