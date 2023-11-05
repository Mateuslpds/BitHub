<script>
	import { onMount } from "svelte";
	import axios from "axios";

	let r;
	let newKey;
	let indexRoot;

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

	function createNewNode(key, name, content) {
		return new Node(key, name, content);
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
		return true;
	}

	function displayTreeConsole(root) {
		if (!root) return "";
		let result =
			root.key +
			"(|Name: " +
			root.name +
			"|Content: " +
			root.content +
			"|";
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
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>BitHub</h1>
	<input type="file" id="fileInput" />
	<button on:click={handleSubmit}>Submit</button>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}
</style>
