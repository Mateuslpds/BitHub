<script>
	import { onMount } from "svelte";
	import axios from "axios";

	let r;
	let newKey;
	let indexRoot;
	let uploadedFiles = [];
	let fileContent = "";

	onMount(() => {
		newKey = 0;
		const initialValue = newKey;
		r = initialize(initialValue);
		indexRoot = initialValue;
		console.log(displayTreeConsole(r));
	});

	newKey = 0;

	class Node {
		constructor(key, name, content) {
			this.key = key;
			this.name = name;
			this.content = content;
			this.date = new Date();
			this.firstChild = null;
			this.nextSibling = null;
		}
	}

	function createNewNode(key, name, content, date) {
		return new Node(key, name, content, date);
	}

	function initialize(key) {
		return createNewNode(key, "root", "root");
	}

	function searchForKey(key, root) {
		if (!root) return null;
		if (root.key === key) return root;
		let p = root.firstChild;
		while (p) {
			const found = searchForKey(key, p);
			if (found) return found;
			p = p.nextSibling;
		}
		return null;
	}

	function searchForKeyIndex(key, root) {
		if (!root) return -1;
		if (root.key === key) return root.key;
		let p = root.firstChild;
		while (p) {
			const result = searchForKeyIndex(key, p);
			if (result !== -1) return result;
			p = p.nextSibling;
		}
		return -1;
	}

	function upload(root, name, content, parentKey) {
		newKey++;
		const parent = searchForKey(parentKey, root);
		if (!parent) return false;
		const child = createNewNode(newKey, name, content);
		let p = parent.firstChild;
		if (!p) {
			parent.firstChild = child;
		} else {
			while (p.nextSibling) {
				p = p.nextSibling;
			}
			p.nextSibling = child;
		}
		console.log(displayTreeConsole(r));
		return true;
	}

	function update(root, content, parentKey) {
		newKey++;
		const parent = searchForKey(parentKey, root);
		if (!parent) return false;
		const child = createNewNode(newKey, (name = parent.name), content);
		let p = parent.firstChild;
		if (!p) {
			parent.firstChild = child;
		} else {
			while (p.nextSibling) {
				p = p.nextSibling;
			}
			p.nextSibling = child;
		}
		console.log(displayTreeConsole(r));
		console.log("Foi feito o update");
		return true;
	}

	function displayTreeConsole(root) {
		if (!root) return "";
		let result = root.key + "(|Name: " + root.name + "|";
		let p = root.firstChild;
		while (p) {
			result += displayTreeConsole(p);
			p = p.nextSibling;
		}
		result += ")";
		return result;
	}

	function displayLastSibling(root, key) {
		const node = searchForKey(key, root);
		if (node) {
			let lastSibling = node;
			while (lastSibling.nextSibling) {
				lastSibling = lastSibling.nextSibling;
			}
			console.log(
				`Last Sibling: Key = ${lastSibling.key}, Content = ${lastSibling.content}`
			);
		} else {
			console.log("Node not found");
		}
	}

	//handle submit
	function handleSubmit(e) {
		let fileElement = document.getElementById("fileInput");

		// check if user had selected a file
		if (fileElement.files.length === 0) {
			alert("please choose a file");
			return;
		}

		let file = fileElement.files[0];
		const reader = new FileReader();
		reader.onload = function (e) {
			upload(r, file.name, e.target.result, indexRoot);

			// Adicione o arquivo carregado ao array de arquivos enviados
			addUploadedFile(newKey, file.name, e.target.result);
		};
		reader.readAsText(file);

		let formData = new FormData();
		formData.set("file", file);

		axios
			.post("http://localhost:3001/upload-single-file", formData, {})
			.then((res) => {});
	}

	function addUploadedFile(key, name, content) {
		uploadedFiles = [...uploadedFiles, { key, name, content }];
	}

	function handleUpdate(index) {
		let fileElement = document.getElementById("fileUpdate-" + index);

		// check if user had selected a file
		if (fileElement.files.length === 0) {
			alert("please choose a file");
			return;
		}

		let file = fileElement.files[0];
		const reader = new FileReader();
		reader.onload = function (e) {
			update(r, e.target.result, index);
		};
		reader.readAsText(file);

		let formData = new FormData();
		formData.set("file", file);

		axios
			.post("http://localhost:3001/upload-single-file", formData, {
				onUploadProgress: (progressEvent) => {
					const percentCompleted = Math.round(
						(progressEvent.loaded * 100) / progressEvent.total
					);
					console.log(`upload process: ${percentCompleted}%`);
				},
			})
			.then((res) => {
				console.log(res.data);
				console.log(res.data.url);
			});
	}

	let showPopup = false;
	let selectedFileVersions = [];

	function handlePopup(key) {
		const node = searchForKey(key, r);
		if (node) {
			selectedFileVersions = [];
			let p = node.firstChild;
			while (p) {
				selectedFileVersions = [...selectedFileVersions, p];
				p = p.nextSibling;
			}
			showPopup = true;
		}
	}

	let showVersion = false;

	function showVersionContent(key) {
		const node = searchForKey(key, r);
		if (node) {
			// Atualize o conteúdo do arquivo para a versão selecionada
			updateFileContent(node.content);
			showVersion = true;
		}
	}

	function updateFileContent(content) {
		// Atualize a variável fileContent com o novo conteúdo
		fileContent = content;
	}

	function showLatestVersionContent(key) {
		const node = searchForKey(key, r);
		if (node) {
			let mostRecentVersion = getMostRecentVersion(node);
			if (mostRecentVersion) {
				updateFileContent(mostRecentVersion.content);
				showVersion = true;
			}
		}
	}

	function getMostRecentVersion(node) {
		let mostRecent = node;
		let p = node.firstChild;
		while (p) {
			if (p.date > mostRecent.date) {
				mostRecent = p;
			}
			p = p.nextSibling;
		}
		return mostRecent;
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

 
<section>
	<div class="hub">
		<h1>BitHub</h1>
	</div>
 
	<div class="primeiroinput">
		<input type="file" id="fileInput" placeholder="Choose a file" />
		<button on:click={handleSubmit} class="btn-primary">Enviar</button>
	</div>
 
<div>	
	<div class="container">
		<ul class="box">
			{#each uploadedFiles as file (file.name)}
				<h3><b>Nome do arquivo:</b> {file.name}</h3>
				<input type="file" id={"fileUpdate-" + file.key} placeholder="Choose a file" />
				<br>
				<div class="alinhar">
					<button on:click={handleUpdate(file.key)} class="btn">Update</button>
					<button on:click={() => handlePopup(file.key)} class="btn">Versões Antigas</button>
					<button on:click={() => showLatestVersionContent(file.key)} class="btn">Mostrar Ultimas Versões</button>
				</div>
			{/each}
		</ul>
	</div>
    {#if showPopup}
        <div class="popup">
            <span class="close" on:click={() => (showPopup = false)}>&times;</span>
			<span class="aviso">Adicione um novo arquivo</span>
            <ul class="popup-version-list">
                {#each selectedFileVersions as version}
                    <li class="popup-version-item">{version.name} - {version.date}</li>
                    <button on:click={() => showVersionContent(version.key)} class="btn-secondary">Return to this version</button>
                {/each}
            </ul>
        </div>
    {/if}
 
		{#if showVersion}
			<div class="popupversion">
				<span class="aviso2">Versão do arquivo</span>
				<span class="close" on:click={() => (showVersion = false)}>&times;</span>
				<textarea id="fileContentDisplay" bind:value={fileContent} class="file-content"></textarea>
			</div>
		{/if}
 
</div>
</section>
 
<style>
	.primeiroinput{
		width: 580px;
	}
	.aviso{
		font-size: 20px;
		padding-right: 30px;
		color:#6c7074;
	}
	.aviso2{
		font-size: 20px;
		padding-right: 30px;
		color:#6c7074;
	}
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
	.container{
		background-color: white;
		border: black 2px solid;
		padding: 10px;
		margin: 0px;
	}
	.box{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin: 0;
		padding: 0;
		width: 550px;
	}
	.alinhar{
		display: flex;
		flex-direction: row;
	}
	.btn{
		padding: 15px;
		background-color: #6c7074;
		color:white;
		border-radius: 30px;
		margin: 0 5px 0 5px;
		display: flex;
		flex-direction: row;
	}
	.btn:hover{
		background-color: rgb(62, 63, 62);
		color: white;
	}
	.hub {
		background-color: #20242c;
		color: white; 
		padding: 15px;
		text-align: left; 
		width: 100%;
		border-radius: 6px; 
		box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
		font-size: 16px; 
		font-weight: normal; 
	}
	input[type="file"] { 
		width: 60%;
		padding: 10px;
		border: 1px solid #ccc;
		margin: 50px 0;
	}
 
	.btn-primary {
		background-color: #28a745;
		color: white;
		padding: 15px 20px;
		border: none;
		cursor: pointer;
	}
 
	.btn-secondary {
		background-color: #6c757d;
		color: white;
		padding: 5px 10px;
		border: none;
		margin-left: 10px;
		cursor: pointer;
	}
 
	.popup {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: white;
		padding: 20px;
		border: 1px solid black;
		z-index: 1;
		color: rgb(255, 0, 0);
		padding: 30px 40px;
		font-size: 30px;
	}
 
	.popup-version-list {
		list-style: none;
		padding: 0;
	}
 
	.popup-version-item {
		padding: 5px 0;
	}
 
	.popupversion {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: white;
		padding: 20px;
		border: 1px solid black;
		z-index: 1;
		color: black;
		padding: 30px 40px;
		font-size: 30px;
	}
 
	textarea.file-content {
		width: 600px;
		height: 400px;
		border: 1px solid #ccc;
		padding: 10px;
	}
 
	.close {
		float: right;
		cursor: pointer;
		padding-left: 10px;
		font-size: 40px;
	}
</style>
 