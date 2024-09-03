"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Minus, Plus, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ThirdwebContract } from "thirdweb";
import { ClaimButton, ConnectButton, NFT } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import React from "react";

type Props = {
	contract: ThirdwebContract;
	displayName: string;
	description: string;
	contractImage: string;
	pricePerToken: number | null;
	currencySymbol: string | null;
	isERC1155: boolean;
	tokenId: bigint;
};

export function NftMint(props: Props) {
	console.log(props);
	const [isMinting, setIsMinting] = useState(false);
	const [showToast, setShowToast] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [mounted, setMounted] = useState(false);
	const [useCustomAddress, setUseCustomAddress] = useState(false);
	const [customAddress, setCustomAddress] = useState("");
	const { theme, setTheme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleMint = async () => {
		setIsMinting(true);
		// Simulate minting process
		await new Promise((resolve) => setTimeout(resolve, 2000));
		setIsMinting(false);
		setShowToast(true);
		setTimeout(() => setShowToast(false), 3000);
	};

	const decreaseQuantity = () => {
		setQuantity((prev) => Math.max(1, prev - 1));
	};

	const increaseQuantity = () => {
		setQuantity((prev) => Math.min(10, prev + 1)); // Assuming a max of 10 NFTs can be minted at once
	};

	const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(e.target.value, 10);
		if (!Number.isNaN(value)) {
			setQuantity(Math.min(Math.max(1, value), 10));
		}
	};

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	if (!mounted) return null;
	if (!props.pricePerToken) {
		console.error("Invalid pricePerToken");
		return null;
	}
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
			<div className="absolute top-4 right-4">
				<ConnectButton client={client} />
			</div>

			{/* <Button
				variant="outline"
				size="icon"
				className="absolute top-4 right-4"
				onClick={toggleTheme}
				aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
			>
				{theme === "dark" ? (
					<Sun className="h-[1.2rem] w-[1.2rem]" />
				) : (
					<Moon className="h-[1.2rem] w-[1.2rem]" />
				)}
			</Button> */}
			<Card className="w-full max-w-md">
				<CardContent className="pt-6">
					<div className="aspect-square overflow-hidden rounded-lg mb-4 relative">
						{props.isERC1155 ? (
							<NFT contract={props.contract} tokenId={props.tokenId}>
								<React.Suspense>
									<NFT.Media className="w-full h-full object-cover" />
								</React.Suspense>
							</NFT>
						) : (
							<img
								src="/placeholder.svg?height=400&width=400"
								alt="NFT Preview"
								className="w-full h-full object-cover"
							/>
						)}
						<div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm font-semibold">
							{props.pricePerToken} {props.currencySymbol}/each
						</div>
					</div>
					<h2 className="text-2xl font-bold mb-2 dark:text-white">
						{props.displayName}
					</h2>
					<p className="text-gray-600 dark:text-gray-300 mb-4">
						{props.description}
					</p>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center">
							<Button
								variant="outline"
								size="icon"
								onClick={decreaseQuantity}
								disabled={quantity <= 1}
								aria-label="Decrease quantity"
								className="rounded-r-none"
							>
								<Minus className="h-4 w-4" />
							</Button>
							<Input
								type="number"
								value={quantity}
								onChange={handleQuantityChange}
								className="w-16 text-center rounded-none border-x-0"
								min="1"
								max="10"
							/>
							<Button
								variant="outline"
								size="icon"
								onClick={increaseQuantity}
								disabled={quantity >= 10}
								aria-label="Increase quantity"
								className="rounded-l-none"
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>
						<div className="text-lg font-semibold dark:text-white">
							Total: {props.pricePerToken * quantity} {props.currencySymbol}
						</div>
					</div>
					<div className="flex items-center space-x-2 mb-4">
						<Switch
							id="custom-address"
							checked={useCustomAddress}
							onCheckedChange={setUseCustomAddress}
						/>
						<Label htmlFor="custom-address">Mint to a custom address</Label>
					</div>
					{useCustomAddress && (
						<div className="mb-4">
							<Input
								id="address-input"
								type="text"
								placeholder="Enter recipient address"
								value={customAddress}
								onChange={(e) => setCustomAddress(e.target.value)}
								className="w-full"
							/>
						</div>
					)}
				</CardContent>
				<CardFooter>
					<ClaimButton
						contractAddress={props.contract.address}
						chain={props.contract.chain}
						client={props.contract.client}
						claimParams={
							props.isERC1155
								? {
										type: "ERC1155",
										tokenId: props.tokenId,
										quantity: BigInt(quantity),
									}
								: { type: "ERC721", quantity: BigInt(quantity) }
						}
						style={{ backgroundColor: "black", color: "white", width: "100%" }}
						disabled={isMinting}
					>
						Mint {quantity} NFT{quantity > 1 ? "s" : ""}
					</ClaimButton>
				</CardFooter>
			</Card>
			{showToast && (
				<Toast className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md">
					Successfully minted {quantity} NFT{quantity > 1 ? "s" : ""}
					{useCustomAddress && customAddress ? ` to ${customAddress}` : ""}!
				</Toast>
			)}
		</div>
	);
}