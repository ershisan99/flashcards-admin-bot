<script lang="ts">
	import type { Data } from './+page.server';

	export let data: Data;
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableRow,
		TableHeader
	} from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="w-full">
	<h1 class="mb-4 text-3xl font-bold">Группы</h1>
	<div class="mb-4 flex items-center gap-6">
		<form method="POST" action="?/prepareDb">
			<Button type="submit">Подготовить базу данных</Button>
		</form>
		<form method="POST" action="?/fillPreregistered">
			<Button type="submit">Добавить предрегистрированных пользователей</Button>
		</form>
		<form method="POST" action="?/generateGroups">
			<Button type="submit">Сгенерировать группы</Button>
		</form>
		<form>
			<Button>Отправить информацию в Telegram</Button>
		</form>
	</div>
	{#if Object.keys(data.rawData).length}
		<div class="mb-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Имя</TableHead>
						<TableHead>Время</TableHead>
						<TableHead>Telegram</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each Object.entries(data.rawData) as [_, user]}
						<TableRow>
							<TableCell>{user.name}</TableCell>
							<TableCell style="width: 200px"
								>{user.availableTime.from} - {user.availableTime.to}</TableCell
							>
							<TableCell style="width: 200px">{user.tgUsername}</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	{/if}
	<div class="space-y-10">
		{#each data.groups as group}
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Имя</TableHead>
						<TableHead>Время</TableHead>
						<TableHead>Telegram</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each group as el}
						<TableRow>
							<TableCell>{el.name}</TableCell>
							<TableCell style="width: 200px"
								>{el.availableTime.from} - {el.availableTime.to}</TableCell
							>
							<TableCell style="width: 200px">{el.tgUsername}</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		{/each}
	</div>
</div>
