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

	function getAvailableTime(from: number, to: number | null) {
		if (from === 0 && to === 10) return 'До 10 часов';
		if (from === 10 && to === 20) return '10-20 часов';
		if (from === 20 && to === 30) return '20-30 часов';
		if (from === 30 && to === 40) return '30-40 часов';
		if (from === 40) return 'Более 40 часов';
		return 'Unknown time';
	}
</script>

<div class="w-full">
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
		<form method="POST" action="?/sendGroupInfo">
			<Button type="submit">Отправить информацию в Telegram</Button>
		</form>
	</div>
	{#if data.users.length > 0}
		<h2 class="mb-4 text-3xl font-bold">Зарегистрированные пользователи</h2>

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
					{#each data.users as user}
						<TableRow>
							<TableCell>{user.name}</TableCell>
							<TableCell style="width: 200px"
								>{getAvailableTime(user.availableFrom, user.availableTo)}</TableCell
							>
							<TableCell style="width: 200px">{user.tgUsername}</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	{/if}
	<div class="space-y-10">
		{#if data.groups.length > 0}
			<h2 class="mb-4 text-3xl font-bold">Группы</h2>

			{#each data.groups as group (group.id)}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Имя</TableHead>
							<TableHead>Время</TableHead>
							<TableHead>Telegram</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each group.users as user (user.id)}
							<TableRow>
								<TableCell>{user.name}</TableCell>
								<TableCell style="width: 200px"
									>{getAvailableTime(user.availableFrom, user.availableTo)}</TableCell
								>
								<TableCell style="width: 200px">{user.tgUsername}</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			{/each}
		{/if}
	</div>
</div>
